import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const sourceURI = 'mongodb://127.0.0.1:27017/mern-cinema';
const targetURI = 'mongodb+srv://trinhquocbinh05_db_user:yMLHIbL2KWjxrzB3@cluster0.dz9nvll.mongodb.net/mern-cinema?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  console.log('Connecting to Local MongoDB...');
  const sourceConn = await mongoose.createConnection(sourceURI).asPromise();
  
  console.log('Connecting to MongoDB Atlas...');
  const targetConn = await mongoose.createConnection(targetURI).asPromise();

  console.log('Fetching collections from local database...');
  const collections = await sourceConn.db.listCollections().toArray();
  
  for (let collection of collections) {
    const colName = collection.name;
    const sourceCol = sourceConn.collection(colName);
    const targetCol = targetConn.collection(colName);

    console.log(`\nMigrating collection: ${colName}`);
    
    // Xóa dữ liệu cũ trên Atlas (nếu có) để tránh trùng lặp
    await targetCol.deleteMany({});
    
    // Lấy toàn bộ document
    const docs = await sourceCol.find({}).toArray();
    
    if (docs.length > 0) {
      // Insert với options ordered: false để bỏ qua các lỗi lặt vặt
      await targetCol.insertMany(docs, { ordered: false });
      console.log(`=> Đã đẩy thành công ${docs.length} dòng dữ liệu sang Atlas.`);
    } else {
      console.log(`=> Collection trống.`);
    }
  }

  await sourceConn.close();
  await targetConn.close();
  console.log('\n✅ CHUYỂN DỮ LIỆU LÊN ATLAS THÀNH CÔNG!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('\n❌ Lỗi khi chuyển dữ liệu:', err);
  process.exit(1);
});
