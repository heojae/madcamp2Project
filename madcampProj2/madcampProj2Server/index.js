// index.js
// console.log('Hello world')
var express    = require('express');
var mysql      = require('mysql');
var dbconfig   = require('./config/database.js');
var connection = mysql.createConnection(dbconfig);
var url = require('url');
var querystring = require('querystring'); 
var multer = require('multer')
var app = express();
var done = false;

var mime = require('mime');
var fs = require('fs');
var new_token;


//////////////////////////////////////////////////
//                Configuration                 //
//////////////////////////////////////////////////

app.set('port', process.env.PORT || 80);

app.get('/', function(req, res){
    res.send('Root');
});



//////////////////////////////////////////////////
//     3�� �� ���� (�����ڵ��� GPS ��ǥ ����)    //
//////////////////////////////////////////////////

app.get('/coordinates', function(req, res){
    // ������Ʈ�� �Ľ�
    var parsedUrl = url.parse(req.url);
    // console.log(parsedUrl);

    // ��üȭ�� url �߿� Query String �κи� ���� ��üȭ �� ���
    var parsedQuery = querystring.parse(parsedUrl.query,'&','=');
    //console.log(parsedQuery);
    //res.send(parsedQuery);

    var id = parsedQuery['id'];
    var isExit = parsedQuery['isExit'];
    var name = parsedQuery['name'];
    var latitude = parsedQuery['latitude'];
    var longitude = parsedQuery['longitude'];

    if(isExit == 'true'){
        // �����ͺ��̽����� �޾ƿ� ID ���� �� ����
        connection.query('DELETE FROM Coordinates WHERE id=' + id, function(err, rows){
            if(err){
                console.log('Cannot find id=' + id + ' from Coordinates');
                console.log(err);
                //throw err;
            }else{
                console.log('Remove Object id=' + id + ' from Coordinates');
                //console.log('Return data set: ', rows);
            }
        });

        // �����ͺ��̽��� �޾ƿ� ����
        connection.query('SELECT * FROM Coordinates', function(err, rows){
            if(err){
                console.log('Cannot Access to Coordinates');
                console.log(err);
                res.send([]);
            }else{
                //console.log('Return data set: ', rows);
                res.send(rows);
            }
        });

    }else{
        // �����ͺ��̽��� �޾ƿ� ���� �߰��� �� ����
        
        // �����ͺ��̽��� Coordinates ���̺� �����ϴ��� Ȯ��
        connection.query('SELECT * FROM Coordinates', function(err, rows){
            if(err){
                console.log('Cannot Access to Coordinates');
                
                // �����ͺ��̽��� Coordinates ���̺��� �������� ���� ���, ����
                connection.query('CREATE TABLE ' + 'Coordinates' + ' ( id int, name varchar(255), latitude double, longitude double )', function(err, rows){
                    if(err){
                        console.log('Cannot generate data table with name Coordinates');
                        console.log(err);
                    }else{
                        console.log('make Coordinates table');
                    }s
                });
            }else{
                // �����ͺ��̽��� Coordinates ���̺��� �����ϹǷ� ���� �ܰ�� �н�
            }
        });

        // �����ͺ��̽� Coordinates ���̺� ID�� �����ϴ��� Ȯ��
        connection.query('SELECT * FROM Coordinates WHERE id=' + id, function(err, rows){
            //console.log('returned rows by id=' + id + ' from Coordinates: ' + rows)
            if(err){
                console.log('Cannot find id=' + id);
                
                // �����ͺ��̽� Coordinates ���̺� ID�� ������ �߰�
                connection.query('INSERT INTO ' + 'Coordinates' + ' (id, name, latitude, longitude) VALUES(' + id + ', "' + name + '", ' + latitude + ', ' + longitude + ')', function(err, rows){
                    if(err){
                        console.log('Cannot insert data to Coordinate table with id=' + id);
                        console.log(err);
                    }else{
                        console.log('Success to insert id=' + id + ' to Coordinate table');
                    }
                });
            }else{
                if(rows == '')
                {
                    console.log('Cannot find id=' + id);
                
                    // �����ͺ��̽� Coordinates ���̺� ID�� ������ �߰�
                    connection.query('INSERT INTO ' + 'Coordinates' + ' (id, name, latitude, longitude) VALUES(' + id + ', "' + name + '", ' + latitude + ', ' + longitude + ')', function(err, rows){
                        if(err){
                            console.log('Cannot insert data to Coordinate table with id=' + id);
                            console.log(err);
                        }else{
                            console.log('Success to insert id=' + id + ' to Coordinate table');
                        }
                    });
                }else{
                    // �����ͺ��̽� Coordinates ���̺� ID�� ������ ����
                    connection.query('UPDATE ' + 'Coordinates' + ' SET name="' + name + '", latitude=' + latitude + ', longitude=' + longitude + ' WHERE id=' + id, function(err, rows){
                        if(err){
                            console.log('Cannot update data to Coordinate table with id=' + id);
                            console.log(err);
                        }else{
                            console.log('Success to update id=' + id + ' to Coordinate table');
                        }
                    });
                }
            }
        });

        // �����ͺ��̽��� �޾ƿ� ����
        connection.query('SELECT * FROM Coordinates', function(err, rows){
            if(err){
                console.log('Cannot Access to Coordinates');
                console.log(err);
                res.send([]);
            }else{
                //console.log('Return data set: ', rows);
                res.send(rows);
            }
        });
    }
});



//////////////////////////////////////////////////
//     2�� �� ���� (���� ���ε� �ٿ�ε� ����)     //
//////////////////////////////////////////////////

app.use(multer({
    dest: './photos/',
    rename: function (fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
    }
}));

app.get('/upload', function(req, res){
    // ���� ���ε� â
    res.sendfile('index.html');
});

app.post('/api/photo', function (req, res) {
    // ���� ���ε� post
    if (done == true) {
        console.log(req.files);
        res.end("File uploaded.\n" + JSON.stringify(req.files));
    }
});

app.get('/photos/:id', function(req, res){
    // ���ε��� ���� ����
    var parsedUrl = url.parse(req.url);
    var resource = parsedUrl.pathname;

    // 2. ��û�� �ڿ��� �ּҰ� '/images/' ���ڿ��� �����ϸ�
    if(resource.indexOf('/photos/') == 0){
        // 3. ù������ '/' �� �����ϰ� ��θ� imgPath ������ ����
        var imgPath = resource.substring(1);
        console.log('imgPath='+imgPath);
        // 4. ���� �Ϸ��� ������ mime type
        var imgMime = mime.getType(imgPath); // lookup -> getType���� �����
        console.log('mime='+imgMime);

        // 5. �ش� ������ �о� ���µ� �ι�° ������ ���ڵ�(utf-8) �� ����
        fs.readFile(imgPath, function(error, data) {
            if(error){
                res.writeHead(500, {'Content-Type':'text/html'});
                res.end('500 Internal Server '+error);
            }else{
                // 6. Content-Type �� 4������ ������ mime type �� �Է�
                res.writeHead(200, {'Content-Type':imgMime});
                res.end(data);
            }
        });
    }else{
        res.writeHead(404, {'Content-Type':'text/html'});
        res.end('404 Page Not Found');
    }
});

app.post('/post', (req, res) => {
    console.log('who get in here post /users');
    var inputData;
    req.on('data', (data) => {
        inputData = JSON.parse(data);
        var sql = 'INSERT IGNORE INTO TOKEN_'+ inputData.token +'(name, phonenumber, photo, value) VALUES(?, ?, ?, ?)';
        var params = [inputData.name, inputData.phonenumber, 'man1',0];
        var token =inputData.token;
        var making=inputData.making;
        var img_name;
        var img_path;
        new_token=token;
        
        if (making==1){
            connection.query('CREATE TABLE TOKEN_' + token + ' ( name varchar(255), phonenumber varchar(255) , photo varchar(255), value int, PRIMARY KEY (phonenumber) )', function(err, rows){
                if(err){
                    console.log("a2");
                    console.log('siba jottem. cannot generate data table with token');
                    console.log(err);
                }else{
                    console.log("a3");
                    console.log('make token table');
                    //res.send(rows);
                }
            console.log("a4");
            console.log('The solution is: ', rows);
            res.send(rows);
	        });
	
            connection.query('CREATE TABLE TOKEN_' + token +'_2'+ ' ( id varchar(255), img_path varchar(255) , img_name varchar(255), PRIMARY KEY (img_name) )', function(err, rows){
                if(err){
                    console.log("b2");
                    console.log('siba jottem. cannot generate data table with token');
                    console.log(err);
                }else{
                    console.log("b3");
                    console.log('make token_2 table');
                    //res.send(rows);
                }
            });    
	
            
        }        
        if (making==2){
            connection.query(sql, params, function(err, rows, fields){
                if(err) console.log(err);
                console.log("a5");
                console.log(rows);
	            console.log(fields);
            });
        }
        if (making==3){
            var sql_d = 'DELETE FROM TOKEN_'+ inputData.token +' WHERE name=? and phonenumber=? ';
            var params_d = [inputData.name, inputData.phonenumber];
            connection.query(sql_d, params_d, function(err, rows, fields){
                if(err) console.log(err);
                console.log(rows);
            });
        }

        if (making==4){
            connection.query("SELECT * from TOKEN_"+token, function(err,rows){
                if(err) throw err;
                console.log(rows);
                res.send(rows);
                res.write(rows);
            });
        }

        if (making==5){
            var sql_u = 'UPDATE TOKEN_'+'token'+ ' SET name=?, phonenumber=? WHERE phonenumber=?';
            var params_u = [inputData.name, inputData.phonenumber2, inputData.phonenumber];
            connection.query(sql_u, params_u, function(err, rows, fields){
            if(err) console.log(err);
            console.log(rows);
            console.log("phone 2  :"+inputData.phonenumber2);
            });
        }
	    if(making==6){
            token=inputData.token;
            img_path=inputData.img_path;
            img_name=inputData.img_name;
            console.log("img_path:  "+img_path);
            console.log("img_name:  "+img_name);

	        

	        var sql_I = 'INSERT IGNORE INTO TOKEN_'+ token +'_2'+'(id, img_path, img_name) VALUES(?, ?, ?)';
       	    var params_I = [ token, inputData.img_path, inputData.img_name];
                connection.query(sql_I, params_I, function(err, rows, fields){
                if(err) console.log(err);
                console.log(rows);
            });
        }
        if(making==7){
            token=inputData.token;
            img_path=inputData.img_path;
            img_name=inputData.img_name;
            connection.query(' TRUNCATE TOKEN_'+token+'_2', function(err,rows){
                if(err) throw err;
                console.log(rows);
                //res.write(rows);
            });

        }




    });

    req.on('end', () => {
    console.log("  name : "+inputData.name);
    console.log("  phonenumber : "+inputData.phonenumber);
    console.log("  token : "+inputData.token);
    console.log("  maing : "+inputData.making);
    });

    //res.write("OK!");
    res.end();

});

app.get('/photos', function(req, res){
    // ������Ʈ�� �Ľ�
    var parsedUrl = url.parse(req.url);
    // console.log(parsedUrl);

    // ��üȭ�� url �߿� Query String �κи� ���� ��üȭ �� ���
    var parsedQuery = querystring.parse(parsedUrl.query,'&','=');
    console.log(parsedQuery);
    //res.send(parsedQuery);

    var token = parsedQuery['token'];
    //res.send(token);


    // �����ͺ��̽��� �޾ƿ� ó��
    connection.query('SELECT * from TOKEN_' + token + "_2", function(err, rows){
        if(err){
            console.log('Cannot Access to TOKEN_' + token + "_2" + '. Trying to generate data table.')
            //console.log(err);
            //throw err;
            
            // token �̸��� �������� ���ο� ������ ���̺� ����
            connection.query('CREATE TABLE TOKEN_' + token +'_2'+ ' ( id varchar(255), img_path varchar(255) , img_name varchar(255), PRIMARY KEY (img_name) )', function(err, rows){
                if(err){
                    console.log('siba jottem. cannot generate data table with token');
                    console.log(err);
                }else{
                    console.log('make token table');
                    res.send(rows);
                }
            });

        }else{
            console.log('The solution is: ', rows);
            res.send(rows);
        }
    });
});


//////////////////////////////////////////////////
//    1�� �� ���� (����ó ���ε� �ٿ�ε� ����)    //
//////////////////////////////////////////////////

app.get('/contacts', function(req, res){
    // ������Ʈ�� �Ľ�
    var parsedUrl = url.parse(req.url);
    // console.log(parsedUrl);

    // ��üȭ�� url �߿� Query String �κи� ���� ��üȭ �� ���
    var parsedQuery = querystring.parse(parsedUrl.query,'&','=');
    console.log(parsedQuery);
    //res.send(parsedQuery);

    var token = parsedQuery['token'];
    //res.send(token);


    // �����ͺ��̽��� �޾ƿ� ó��
    connection.query('SELECT * from TOKEN_' + token, function(err, rows){
        if(err){
            console.log('Cannot Access to TOKEN_' + token + '. Trying to generate data table.')
            //console.log(err);
            //throw err;
            
            // token �̸��� �������� ���ο� ������ ���̺� ����
            connection.query('CREATE TABLE TOKEN_' + token + ' ( name varchar(255), phonenumber varchar(255) , photo varchar(255), value int, PRIMARY KEY (phonenumber) )', function(err, rows){
                if(err){
                    console.log('siba jottem. cannot generate data table with token');
                    console.log(err);
                }else{
                    console.log('make token table');
                    res.send(rows);
                }
            });

        }else{
            console.log('The solution is: ', rows);
            res.send(rows);
        }
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});