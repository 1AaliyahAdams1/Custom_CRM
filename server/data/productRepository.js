const sql = require("mssql");
const { dbConfig } = require("../dbConfig");

// =======================
// Audit log for TempProduct
// =======================
async function insertTempProductLog(pool, {
  ProductID,
  AccountID = null,
  ProductName = null,
  Description = null,
  Price = null,
  Cost = null,
  SKU = null,
  CategoryID = null,
  ChangedBy = "System",
  ActionType = "UPDATE",
  UpdatedAt = new Date(),
}) {
  const includeCreatedAt = ActionType === "CREATE" || ActionType === "DELETE";

  const query = `
    INSERT INTO TempProduct (
      ProductID, AccountID, ProductName, Description, Price, Cost, SKU, CategoryID,
      ChangedBy, ActionType, UpdatedAt${includeCreatedAt ? ', CreatedAt' : ''}
    ) VALUES (
      @ProductID, @AccountID, @ProductName, @Description, @Price, @Cost, @SKU, @CategoryID,
      @ChangedBy, @ActionType, @UpdatedAt${includeCreatedAt ? ', GETDATE()' : ''}
    )
  `;

  await pool.request()
    .input("ProductID", sql.Int, ProductID)
    .input("AccountID", sql.Int, AccountID)
    .input("ProductName", sql.NVarChar(255), ProductName)
    .input("Description", sql.NVarChar(sql.MAX), Description)
    .input("Price", sql.Decimal(18, 2), Price)
    .input("Cost", sql.Decimal(18, 2), Cost)
    .input("SKU", sql.NVarChar(100), SKU)
    .input("CategoryID", sql.Int, CategoryID)
    .input("ChangedBy", sql.VarChar(100), ChangedBy)
    .input("ActionType", sql.VarChar(20), ActionType)
    .input("UpdatedAt", sql.DateTime, UpdatedAt)
    .query(query);
}

// =======================
// Get all products
// =======================
async function getAllProducts() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT * FROM Product ORDER BY ProductName
    `);
    return result.recordset;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

// =======================
// Get product by ID
// =======================
async function getProductById(id) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("ProductID", sql.Int, id)
      .query("SELECT * FROM Product WHERE ProductID = @ProductID");
    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

// =======================
// Create new product
// =======================
async function createProduct(productData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);
    const { AccountID, ProductName, Description, Price, Cost, SKU, CategoryID } = productData;

    const result = await pool.request()
      .input("AccountID", sql.Int, AccountID)
      .input("ProductName", sql.NVarChar(255), ProductName)
      .input("Description", sql.NVarChar(sql.MAX), Description)
      .input("Price", sql.Decimal(18, 2), Price)
      .input("Cost", sql.Decimal(18, 2), Cost)
      .input("SKU", sql.NVarChar(100), SKU)
      .input("CategoryID", sql.Int, CategoryID)
      .query(`
        INSERT INTO Product 
          (AccountID, ProductName, Description, Price, Cost, SKU, CategoryID, CreatedAt, UpdatedAt)
        VALUES
          (@AccountID, @ProductName, @Description, @Price, @Cost, @SKU, @CategoryID, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() AS ProductID;
      `);

    const newProductId = result.recordset[0].ProductID;

    // Audit log full snapshot on create
    await insertTempProductLog(pool, {
      ProductID: newProductId,
      AccountID,
      ProductName,
      Description,
      Price,
      Cost,
      SKU,
      CategoryID,
      ChangedBy: changedBy,
      ActionType: "CREATE"
    });

    return { ProductID: newProductId };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

// =======================
// Update product
// =======================
async function updateProduct(id, productData, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("ProductID", sql.Int, id)
      .query("SELECT * FROM Product WHERE ProductID = @ProductID");

    if (existingResult.recordset.length === 0) {
      throw new Error("Product not found");
    }

    const existing = existingResult.recordset[0];
    const { AccountID, ProductName, Description, Price, Cost, SKU, CategoryID } = productData;

    await pool.request()
      .input("ProductID", sql.Int, id)
      .input("AccountID", sql.Int, AccountID)
      .input("ProductName", sql.NVarChar(255), ProductName)
      .input("Description", sql.NVarChar(sql.MAX), Description)
      .input("Price", sql.Decimal(18, 2), Price)
      .input("Cost", sql.Decimal(18, 2), Cost)
      .input("SKU", sql.NVarChar(100), SKU)
      .input("CategoryID", sql.Int, CategoryID)
      .query(`
        UPDATE Product SET
          AccountID = @AccountID,
          ProductName = @ProductName,
          Description = @Description,
          Price = @Price,
          Cost = @Cost,
          SKU = @SKU,
          CategoryID = @CategoryID,
          UpdatedAt = GETDATE()
        WHERE ProductID = @ProductID
      `);

    // Detect changed fields only
    const fieldsChanged = {
      AccountID: AccountID !== existing.AccountID ? AccountID : null,
      ProductName: ProductName !== existing.ProductName ? ProductName : null,
      Description: Description !== existing.Description ? Description : null,
      Price: Price !== existing.Price ? Price : null,
      Cost: Cost !== existing.Cost ? Cost : null,
      SKU: SKU !== existing.SKU ? SKU : null,
      CategoryID: CategoryID !== existing.CategoryID ? CategoryID : null,
    };

    await insertTempProductLog(pool, {
      ProductID: id,
      ...fieldsChanged,
      ChangedBy: changedBy,
      ActionType: "UPDATE"
    });

    return { message: "Product updated", ProductID: id };
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

// =======================
// Delete product (hard delete)
// =======================
async function deleteProduct(id, changedBy = "System") {
  try {
    const pool = await sql.connect(dbConfig);

    const existingResult = await pool.request()
      .input("ProductID", sql.Int, id)
      .query("SELECT * FROM Product WHERE ProductID = @ProductID");

    if (existingResult.recordset.length === 0) {
      throw new Error("Product not found");
    }

    const deleted = existingResult.recordset[0];

    await pool.request()
      .input("ProductID", sql.Int, id)
      .query("DELETE FROM Product WHERE ProductID = @ProductID");

    // Audit full snapshot on delete
    await insertTempProductLog(pool, {
      ProductID: deleted.ProductID,
      AccountID: deleted.AccountID,
      ProductName: deleted.ProductName,
      Description: deleted.Description,
      Price: deleted.Price,
      Cost: deleted.Cost,
      SKU: deleted.SKU,
      CategoryID: deleted.CategoryID,
      ChangedBy: changedBy,
      ActionType: "DELETE"
    });

    return { message: "Product deleted", ProductID: id };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

// =======================
// Exports
// =======================
module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
