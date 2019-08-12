const db = {
    url : "mongodb://localhost:27017/online2018",
}

const mongoose = require("mongoose");
const tables = require("./tables");

//connect to db
mongoose.connect(db.url,() => {
    var Schema  = mongoose.Schema;

    Object.keys(tables).forEach((collection) => {
        let tempSchema = new Schema(tables[collection]);
        let table = mongoose.model(collection, tempSchema);

        DB[collection] = table;
        console.log(`${collection} Table appended in Global var DB`);
    });
},(err)=>{
    console.log(err);
});
