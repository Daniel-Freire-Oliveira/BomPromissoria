function init(){
    var express = require('express');
    var bodyParser = require("body-parser")
    var app = express();
    const path = require('path');
    var model = require("../model/model")
    app.set('view engine','ejs')
    app.set('views',path.join(__dirname,'..',"view"))
    app.use(express.static(path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'css')));
    app.use(bodyParser.urlencoded({extended:true}))

    var pdr = new Object();
    var data = new Date();


    function gerarIdProduto(length) {
        let caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let idProduto = '';
        for (let i = 0; i < length; i++) {
            idProduto += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return idProduto;
    }



    app.get("/", (req,res)=>{
        res.render("index")
        //mdl.model;
    })
    app.post('/login', (req,res)=>{
        if(req.body.nm == 1 && req.body.psw == 1){
            res.redirect("/admin")
            console.log("redirecionado")
            return;
        }
        console.log("nao redirecionado")
        res.redirect("/")
    })

    app.get("/admin", (req,res)=>{
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
    })

   



    app.get("/adicionar", (req,res)=>{
        res.render("cadastro")
    })

    app.post("/add",(req,res)=>{

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
        pdr.dataAt = new Date().toLocaleDateString('pt-BR');;
        model.add(req.body.cpf,pago, pdr,1,false)
        console.log(pdr)
        res.redirect("/admin")
    })



    app.get("/info/:idi",(req,res)=>{
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
    })

    app.get("/update/:idi",(req,res)=>{
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
    })
    app.post("/updt/:idi", (req,res)=>{
        let dataInicial = new Date(req.body.emiss);  
        let dataFinal = new Date(dataInicial.setDate(dataInicial.getDate() + 31));
        venci = dataFinal.toLocaleDateString('pt-BR');
        var pago = false;
        model.readAll("./dados", (erro, objetos) => {
            if (erro) {
                res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
            } else {
                for(obijeto of objetos){
                    if(obijeto.id === req.params.idi){
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
                        pdr.dataAt = new Date().toLocaleDateString('pt-BR');;
                        model.add(req.body.cpf,pago, pdr,1,true, obijeto.nomeArq)
                        console.log("valor atualizado")
                        res.redirect("/admin")
                
                    }else{console.log("usuario nao encontrado")}
                }
            }
        });
    })
    app.get("/filtro/:cpf",(req,res)=>{
        model.find("./dados", req.params.cpf, (erro, resultados) => {
            if (erro) {
                return console.error(`Erro: ${erro.message}`);
            }else{
                res.render("filtro",{objetos:resultados,cpf:req.params.cpf})
            }
    })})


    app.get("/filtroNome/:nome",(req,res)=>{
        var dir = "./dados"
        model.findByContent(dir, req.params.nome, "nome",0.2,(error, results) => {
            if (error) {
                return console.error(`Erro: ${error.message}`);
            }
            else{
                res.render("filtroNome",{objetos:results,cpf:req.params.nome})
            }
        });
    })
    app.get("/vencidos", (req, res) => {
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
                    res.render("vencidos", { obj: objetosVencidos });
                } else {
                    res.status(404).send("Não existem arquivos vencidos :)");
                }
            });
    });
    

    app.get("/delete/:idi",(req,res)=>{
        model.readAll("./dados", (erro, objetos) => {
            if (erro) {
                res.status(500).send('Erro ao ler os arquivos JSON: ' + erro.message);
            } else {
                for(var obijeto of objetos){
                    if(obijeto.id === req.params.idi){
                        model.rmv("./dados/"+obijeto.nomeArq+".json")
                        res.redirect("/admin")
                    }
                    else{
                        console.log("usuario nao encontrado")}
                }
            }
        });
        
    })
    app.get("/exportar/",(req,res)=>{
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
                    model.exportar(objetosVencidos);        
                    console.log("exportado")
                    res.redirect("/admin")
            } else {
                res.status(404).send("Não existem arquivos vencidos :)");
            }
        });
        

    })
    app.listen(9000,()=>{console.log("Rodando")});
}
exports.init = init();