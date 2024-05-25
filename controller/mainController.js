function init(){
    var express = require('express');
    const session = require('express-session');
    var bodyParser = require("body-parser")
    var app = express();
    const path = require('path');
    var model = require("../model/model")
    app.set('view engine','ejs')
    app.set('views',path.join(__dirname,'..',"view"))
    app.use(express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js')));
    app.use(express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'css')));
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(session({
        secret: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));

    var pdr = new Object();

    function gerarIdProduto(length) {
        let caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let idProduto = '';
        for (let i = 0; i < length; i++) {
            idProduto += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return idProduto;
    }

    //login e logout 
    app.get("/login", (req,res)=>{
        res.render("index")
        //mdl.model;
    })
    app.post('/login', (req,res)=>{
        if(req.body.nm == 1 && req.body.psw == 1){
            req.session.user = { id: 1, name: 'Admin' }
            res.redirect("/")
            console.log("redirecionado")
            return;
        }
        console.log("nao redirecionado")
        res.redirect("/")
    })
    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.send('Erro ao sair.');
            }
            res.clearCookie('connect.sid');
            res.redirect("/login");
        });
    });


    app.get("/", (req,res)=>{
        if(req.session.user){
            const pagina = parseInt(req.query.pagina) || 1; // Página padrão é 1
            const limite = 10; // Número de itens por página
            const offset = (pagina - 1) * limite;
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    const objetosPaginados = objetos.slice(offset, offset + limite);
                    const totalPages = Math.ceil(objetos.length / limite);
                    const sortedItems = objetos.slice().sort((a, b) => b.createdAt - a.createdAt);
                    res.render("admin",{obj:sortedItems,paginaAtual: pagina,totalPages: totalPages});
                }
            });
        }else{res.redirect("/login");}
    })

   



    app.get("/adicionar", (req,res)=>{
        if(req.session.user){
            res.render("cadastro")
        }else{res.redirect("/login");}
    })

    app.post("/add",(req,res)=>{
        if(req.session.user){
            let dataInicial = new Date(req.body.emiss);  
            let dataFinal = new Date(dataInicial.setDate(dataInicial.getDate() + 31));
            venci = dataFinal.toLocaleDateString('pt-BR');
            var pago = false;
            pdr.id = gerarIdProduto(8);
            pdr.nome = req.body.nm;
            pdr.cpf = req.body.cpf;
            pdr.emissao = req.body.emiss;
            pdr.vencimento = venci
            pdr.endereco = req.body.end;
            pdr.bairro = req.body.bair;
            pdr.valor = req.body.val;
            pdr.descricao = req.body.desc;
            pdr.apelido = req.body.apel;
            pdr.pago = "false"
            pdr.dataAt = model.getDataHoraAtual();
            model.add(req.body.cpf,pdr.pago, pdr,1,false)
            console.log(pdr)
            res.redirect("/")
    }else{res.redirect("/login");}
    })



    app.get("/info/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            res.render("info", {obj:obijeto, id:req.params.idi})
                            console.log("deu certo")
                    
                        }else{console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })

    app.get("/update/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            res.render("aba", {obj:obijeto,id:req.params.idi})
                            console.log("deu certo")
                    
                        }else{console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.post("/updt/:idi", (req, res) => {
        if(req.session.user){
            let dataInicial = new Date(req.body.emiss);
            let dataFinal = new Date(dataInicial.setDate(dataInicial.getDate() + 31));
            const venci = dataFinal.toLocaleDateString('pt-BR');
            var pagos;
            if(req.body.pago){
                 pagos = "true";
            }else{ pagos = "false";}
        
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    const obijeto = objetos.find(obj => obj.id === req.params.idi);
        
                    if (obijeto) {
                        const pdr = {
                            id: gerarIdProduto(8),
                            nome: req.body.nm,
                            cpf: req.body.cpf,
                            emissao: req.body.emiss,
                            vencimento: venci,
                            endereco: req.body.end,
                            bairro: req.body.bair,
                            valor: req.body.val,
                            descricao: req.body.desc,
                            apelido: req.body.apel,
                            pago: pagos,
                            dataAt: model.getDataHoraAtual(),
                            nomeArq: ''
                        };
        
                        if (req.body.pago) {
                            model.move(req.body.cpf, "true", 1, obijeto.nomeArq, pdr);
                        } else {
                            model.add(req.body.cpf, "false", pdr, 1, true, obijeto.nomeArq);
                        }
                        console.log("valor atualizado");
                        res.redirect("/");
                    } else {
                        console.log("usuario nao encontrado");
                        res.status(404).send("Usuário não encontrado");
                    }
                }
            });
        }else{res.redirect("/login");}
    });
    
    app.get("/filtro/:cpf",(req,res)=>{
        if(req.session.user){
            model.find("./dados", req.params.cpf, (erro, resultados) => {
                if (erro) {
                    return console.error(`Erro: ${erro.message}`);
                }else{
                    res.render("filtro",{objetos:resultados,cpf:req.params.cpf})
                }
            })
        }else{res.redirect("/login");}
})


    app.get("/filtroNome/:nome",(req,res)=>{
        if(req.session.user){
            var dir = "./dados"
            model.findByContent(dir, req.params.nome, "nome",0.45,(error, results) => {
                if (error) {
                    return console.error(`Erro: ${error.message}`);
                }
                else{
                    res.render("filtroNome",{objetos:results,cpf:req.params.nome})
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/vencidos", (req, res) => {
        if(req.session.user){
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    return res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                }
        
                let objetosVencidos = [];
                let today = new Date();
        
                for (let obijeto of objetos) {
                    let parts = obijeto.vencimento.split('/');
                    let date = new Date(parts[2], parts[1] - 1, parts[0]);
        
                    if (date < today) {
                        objetosVencidos.push(obijeto);
                    }
                }
        
                if (objetosVencidos.length > 0) {
                    res.render("vencidos", { obj: objetosVencidos, exportado:"naoPagos",dir:"exportar"});
                } else {
                    res.status(404).send("Não existem arquivos vencidos :)");
                }
            });
        }else{res.redirect("/login");}
    });
    

    app.get("/delete/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obj of objetos){
                        if(obj.id === req.params.idi){
                            model.rmv(obj.cpf,false,1,obj.nomeArq,obj,"dados/deletados","dados")
                            res.redirect("/")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
        
    })
    app.get("/exportar/",(req,res)=>{
        if(req.session.user){
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    return res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                }
        
                let objetosVencidos = [];
                let today = new Date();
        
                for (let obijeto of objetos) {
                    let parts = obijeto.vencimento.split('/');
                    let date = new Date(parts[2], parts[1] - 1, parts[0]);
        
                    if (date < today) {
                        objetosVencidos.push(obijeto);
                    }
                }
        
                if (objetosVencidos.length > 0) {
                        model.exportar(objetosVencidos,"naoPagos");        
                        console.log("exportado")
                        res.redirect("/")
                } else {
                    res.status(404).send("Não existem arquivos vencidos :)");
                }
            });
        }else{res.redirect("/login");}
        

    })

    //bloco de pagos
    app.get("/pagos", (req,res)=>{
        if(req.session.user){
            const pagina = parseInt(req.query.pagina) || 1; // Página padrão é 1
            const limite = 10; // Número de itens por página
            const offset = (pagina - 1) * limite;
            model.readAll("./pagos", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    const objetosPaginados = objetos.slice(offset, offset + limite);
                    const totalPages = Math.ceil(objetos.length / limite);
                    const sortedItems = objetos.slice().sort((a, b) => b.createdAt - a.createdAt);
                    res.render("pagosTeste",{obj:sortedItems,paginaAtual: pagina,totalPages: totalPages});
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/pagos/vencidos", (req, res) => {
        if(req.session.user){
            model.readAll("./pagos", (erro, objetos) => {
                if (erro) {
                    return res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                }
        
                let objetosVencidos = [];
                let today = new Date();
        
                for (let obijeto of objetos) {
                    let parts = obijeto.vencimento.split('/');
                    let date = new Date(parts[2], parts[1] - 1, parts[0]);
        
                    if (date < today) {
                        objetosVencidos.push(obijeto);
                    }
                }
        
                if (objetosVencidos.length > 0) {
                    res.render("vencidos", { obj: objetosVencidos,exportado:"pagos",dir:"pagos/exportar" });
                } else {
                    res.status(404).send("Não existem arquivos vencidos :)");
                }
            });
        }else{res.redirect("/login");}
});
    app.get("/pagos/info/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./pagos", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            res.render("infoPagos", {obj:obijeto, id:req.params.idi})
                            console.log("deu certo")
                    
                        }else{console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/pagos/delete/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./pagos", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            model.rmv(obijeto.cpf,obijeto.pago,1,obijeto.nomeArq,obijeto,"pagos/pagosDeletados","pagos")
                            res.redirect("/pagos")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
        
    })
    app.get("/pagos/pagosDeletados",(req,res)=>{
        if(req.session.user){
            model.readAll("./pagos/pagosDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    res.render("pagosDeletados",{obj:objetos})
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/pagos/exportar/",(req,res)=>{
        if(req.session.user){
            model.readAll("./pagos", (erro, objetos) => {
                if (erro) {
                    return res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                }
        
                let objetosVencidos = [];
                let today = new Date();
        
                for (let obijeto of objetos) {
                    let parts = obijeto.vencimento.split('/');
                    let date = new Date(parts[2], parts[1] - 1, parts[0]);
        
                    if (date < today) {
                        objetosVencidos.push(obijeto);
                    }
                }
        
                if (objetosVencidos.length > 0) {
                        model.exportar(objetosVencidos,"pagos");        
                        console.log("exportado")
                        res.redirect("/pagos")
                } else {
                    res.status(404).send("Não existem arquivos vencidos :)");
                }
            });
        }else{res.redirect("/login");}
        

    })
    app.get("/pagos/pagosDeletados/exportar/",(req,res)=>{
        if(req.session.user){
            model.readAll("./pagos/pagosDeletados", (erro, objetos) => {
                if (erro) {
                    return res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                }        
                model.exportar(objetos,"pagos/pagosDeletados");        
                console.log("exportado")
                res.redirect("/pagos/pagosDeletados")

            });
        }else{res.redirect("/login");}
        

    })
    app.get("/pagos/filtro/:cpf",(req,res)=>{
        if(req.session.user){
            model.find("./pagos", req.params.cpf, (erro, resultados) => {
                if (erro) {
                    return console.error(`Erro: ${erro.message}`);
                }else{
                    res.render("filtroPago",{objetos:resultados,cpf:req.params.cpf})
                }
            })
        }else{res.redirect("/login");}
})


    app.get("/pagos/filtroNome/:nome",(req,res)=>{
        if(req.session.user){
            var dir = "./pagos"
            model.findByContent(dir, req.params.nome, "nome",0.45,(error, results) => {
                if (error) {
                    return console.error(`Erro: ${error.message}`);
                }
                else{
                    res.render("filtroNomePago",{objetos:results,cpf:req.params.nome})
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/pagos/pagosDeletados/recupera/:id",(req,res)=>{
        if(req.session.user){
            model.readAll("./pagos/pagosDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obj of objetos){
                        if(obj.id === req.params.id){
                            model.recuperaArq(obj.cpf,obj.pago,1,obj.nomeArq,obj,"pagos","pagos/pagosDeletados")
                            res.redirect("/pagos/pagosDeletados")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/pagos/pagosDeletados/info/:idi", (req, res) => {
        if(req.session.user){
            model.readAll("./pagos/pagosDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    if (Array.isArray(objetos)) {
                        let encontrado = false;
                        for (let obijeto of objetos) {
                            if (obijeto.id === req.params.idi) {
                                res.render("pagosDeletadosInfo", { obj: obijeto , id:obijeto.id});
                                encontrado = true;
                                break;
                            }
                        }
                        if (!encontrado) {
                            res.status(404).send('Usuário não encontrado');
                        }
                    } else {
                        res.status(500).send('Dados inválidos: objetos não é um array');
                    }
                }
            });
        }else{res.redirect("/login");}
    });
    app.get("/pagos/removePermanente/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./pagos/pagosDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            model.rmvPerm("./pagos/pagosDeletados/"+obijeto.nomeArq+".json")
                            res.redirect("/pagos/pagosDeletados")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    

    //bloco de deletados
    app.get("/linkDeletados",(req,res)=>{
        if(req.session.user){
            res.render("linkDeletados")
        }else{res.redirect("/login");}
    })

    app.get('/deletados',(req,res)=>{
        if(req.session.user){
            model.readAll("./dados/deletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    res.render("deletados",{obj:objetos});
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/deletados/info/:id",(req,res)=>{
        if(req.session.user){
            model.readAll("./dados/deletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.id){
                            res.render("infoDeletados",{obj:obijeto})
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/deletados/permanente/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./dados/deletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            model.rmvPerm("./dados/deletados/"+obijeto.nomeArq+".json")
                            res.redirect("/deletados")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })


    //bloco serasa
    app.get("/serasa", (req,res)=>{
        if(req.session.user){
            model.readAll("./serasa", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    res.render("serasa",{obj:objetos})
                }
            });
        }else{res.redirect("/login");}
    })

    app.get("/serasa/info/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            res.render("serasaInfo", {obj:obijeto, id:req.params.idi})
                            console.log("deu certo")
                    
                        }else{console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/serasa/filtroNome/:nome",(req,res)=>{
        if(req.session.user){
            var dir = "./serasa"
            model.findByContent(dir, req.params.nome, "nome",0.45,(error, results) => {
                if (error) {
                    return console.error(`Erro: ${error.message}`);
                }
                else{
                    res.render("filtroNomeSerasa",{objetos:results,cpf:req.params.nome})
                }
            });
        }else{res.redirect("/login");}
    })

    app.get("/serasa/recuperar/:id",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obj of objetos){
                        if(obj.id === req.params.id){
                            model.recuperaArq(obj.cpf,obj.pago,1,obj.nomeArq,obj,"dados","serasa")
                            res.redirect("/serasa")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/serasa/incluir/:id", (req,res)=>{
        if(req.session.user){
            model.readAll("./dados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obj of objetos){
                        if(obj.id === req.params.id){
                            model.moveSerasa(obj.cpf,obj.pago,1,obj.nomeArq,obj,"serasa","dados")
                            res.redirect("/")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/serasa/deletados",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa/serasaDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    res.render("serasaDeletados",{obj:objetos})
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/serasa/remover/:id",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obj of objetos){
                        if(obj.id === req.params.id){
                            model.removeSerasa(obj.cpf,obj.pago,1,obj.nomeArq,obj,"serasa/serasaDeletados","serasa")
                            res.redirect("/serasa/")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/serasa/deletados/info/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa/serasaDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            res.render("serasaDeletadosInfo",{obj:obijeto})
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })

    app.get("/serasa/deletados/recuperar/:id",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa/serasaDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obj of objetos){
                        if(obj.id === req.params.id){
                            model.recuperaArq(obj.cpf,obj.pago,1,obj.nomeArq,obj,"serasa","serasa/serasaDeletados")
                            res.redirect("/serasa/deletados")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })

    app.get("/deletados/recupera/:id",(req,res)=>{
        if(req.session.user){
            model.readAll("./dados/deletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obj of objetos){
                        if(obj.id === req.params.id){
                            model.recuperaArq(obj.cpf,obj.pago,1,obj.nomeArq,obj,"dados","dados/deletados")
                            res.redirect("/")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/serasa/deletados/permanente/:idi",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa/serasaDeletados", (erro, objetos) => {
                if (erro) {
                    res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                } else {
                    for(var obijeto of objetos){
                        if(obijeto.id === req.params.idi){
                            model.rmvPerm("./serasa/serasaDeletados/"+obijeto.nomeArq+".json")
                            res.redirect("/serasa/deletados")
                        }
                        else{
                            console.log("usuario nao encontrado")}
                    }
                }
            });
        }else{res.redirect("/login");}
    })
    app.get("/serasa/serasaDeletados/exportar",(req,res)=>{
        if(req.session.user){
            model.readAll("./serasa/serasaDeletados", (erro, objetos) => {
                if (erro) {
                    return res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
                }        
                model.exportar(objetos,"serasaDeletados");        
                console.log("exportado")
                res.redirect("/serasa/deletados")

            });
        }else{res.redirect("/login");}
    })
        //páginas inexistentes
        app.use((req, res, next) => {
            res.status(404);
            res.render('404', { url: req.originalUrl });
        });
    app.listen(9000,()=>{console.log("Rodando")});
}
exports.init = init();