const express = require('express');
const app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

// KHỞI TẠO KẾT NỐI PLC
var nodes7 = require('nodes7');
var conn_plc = new nodes7; //PLC1
// Tạo địa chỉ kết nối (slot = 2 nếu là 300/400, slot = 1 nếu là 1200/1500)
conn_plc.initiateConnection({port: 102, host: '10.14.85.26', rack: 0, slot: 1}, PLC_connected);

//Bảng tag trong Visual studio code
const tag = require('./tag');
const tags_list = tag.tags_list();

// GỬI DỮ LIỆu TAG CHO PLC
// Tag Name load
var taglodash = require('lodash'); // Chuyển variable sang array
var tag_Listarr = taglodash.keys(tags_list);
// GỬI DỮ LIỆu TAG CHO PLC
function PLC_connected(err) {
    if (typeof(err) !== "undefined") {
        console.log(err); // Hiển thị lỗi nếu không kết nối đƯỢc với PLC
    }
    conn_plc.setTranslationCB(function(tag) {return tags_list[tag];});  // Đưa giá trị đọc lên từ PLC và mảng
    conn_plc.addItems(tag_Listarr);
}

// Đọc dữ liệu từ PLC và đưa vào array tags
var arr_tag_value = []; // Tạo một mảng lưu giá trị tag đọc về
var obj_tag_value = []; // Tạo một mảng lưu giá trị tag đọc về
function valuesReady(anythingBad, values) {
    if (anythingBad) { console.log("Lỗi khi đọc dữ liệu tag"); } // Cảnh báo lỗi
    var lodash = require('lodash'); // Chuyển variable sang array
    arr_tag_value = lodash.map(values, (item) => item);
    console.log("Data S1", arr_tag_value); // Hiển thị giá trị để kiểm tra
    obj_tag_value = values;
}

function fn_tag() {
    const events = [
        "DATA","DATA_1", "DATA_2", "DATA_3", "DATA_4", "DATA_5",
        "DATA_6", "DATA_7", "DATA_8", "DATA_9", "DATA_10",
        "DATA_11", "DATA_12", "DATA_13", "DATA_14", "DATA_15",
        "DATA_16", "DATA_17", "DATA_18", "DATA_19", "Trig_Data", "Response_data"
    ];
  
    events.forEach(event => {
        io.sockets.emit(event, obj_tag_value[event]);
    });
}

// Hàm chức năng scan giá trị
function fn_read_data_scan(){
    conn_plc.readAllItems(valuesReady);
    fn_tag();
  }

// Time cập nhật mỗi 1s
setInterval(
    () => fn_read_data_scan(),
    1000 // 1s = 1000ms
);

module.exports = {
    fn_tag
}