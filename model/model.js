const fs = require('fs');
const path = require('path')
const xlsx = require("xlsx");

function stringSimilarity(str1, str2) {
    let longer = str1;
    let shorter = str2;
    if (str1.length < str2.length) {
        longer = str2;
        shorter = str1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function getDataHoraAtual() {
    const dataAtual = new Date();
    const dia = dataAtual.getDate().toString().padStart(2, '0'); // Dia com zero à esquerda se necessário
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0'); // Mês com zero à esquerda se necessário (lembrando que janeiro é 0)
    const ano = dataAtual.getFullYear();
    const hora = dataAtual.getHours().toString().padStart(2, '0'); // Hora com zero à esquerda se necessário
    const minuto = dataAtual.getMinutes().toString().padStart(2, '0'); // Minuto com zero à esquerda se necessário

    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}


function editDistance(str1, str2) {
    const costs = [];
    for (let i = 0; i <= str1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= str2.length; j++) {
            if (i === 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (str1.charAt(i - 1) !== str2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[str2.length] = lastValue;
    }
    return costs[str2.length];
}

function findByContent(dir, searchTerm, fieldToCompare, similarityThreshold, callback) {
    fs.readdir(dir, (error, files) => {
        if (error) {
            return callback(error);
        }

        // Verifica se files é um array
        if (!Array.isArray(files)) {
            return callback(new Error('Erro ao ler o diretório: Não é uma lista de arquivos'));
        }

        // Filtra os arquivos JSON
        const jsonFiles = files.filter(file => path.extname(file) === '.json');

        let results = [];
        let pending = jsonFiles.length;

        if (pending === 0) {
            return callback(null, results);
        }

        jsonFiles.forEach(file => {
            const filePath = path.join(dir, file);
            fs.readFile(filePath, 'utf8', (error, data) => {
                if (error) {
                    return callback(error);
                }

                try {
                    const content = JSON.parse(data);
                    const fieldValue = content[fieldToCompare];

                    // Calculate similarity
                    const similarity = stringSimilarity(searchTerm, fieldValue);
                    if (similarity >= similarityThreshold) {
                        results.push({ nome: file, conteudo: content, similaridade: similarity });
                    }
                } catch (parseError) {
                    return callback(parseError);
                }

                pending--;
                if (pending === 0) {
                    // Sort results by similarity in descending order
                    results.sort((a, b) => b.similaridade - a.similaridade);
                    callback(null, results);
                }
            });
        });
    });
}


function add(cpf, pago, dados, file, atualizar, nomeArquiNovo) {
    const jsonContent = JSON.stringify(dados, null, 2);
    const dirPath = './dados';
    const filePath = path.join(dirPath, `${cpf}_${pago}_${file}.json`);

    // Verifica se o diretório existe, se não, cria-o
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath);
            console.log('Diretório criado:', dirPath);
        } catch (error) {
            console.error('Erro ao criar diretório:', error);
            return;
        }
    }

    // Verifica se o arquivo existe, se não, cria-o
    if (!atualizar) {
        if (!fs.existsSync(filePath)) {
            dados.nomeArq = `${cpf}_${pago}_${file}`;
            const jsonContent = JSON.stringify(dados, null, 2);
            try {
                fs.writeFileSync(filePath, jsonContent);
                console.log('Arquivo criado:', filePath);
            } catch (error) {
                console.error('Erro ao criar arquivo:', error);
            }
        } else {
            if (file > 10000) {  // Condição de parada para evitar recursão infinita
                console.error('Número máximo de tentativas de criação de arquivo alcançado');
                return;
            }
            add(cpf, pago, dados, file + 1, false);
        }
    } else {
        dados.nomeArq = nomeArquiNovo;
        const jsonContent = JSON.stringify(dados, null, 2);
        const filePathNovo = path.join(dirPath, `${nomeArquiNovo}.json`);
        try {
            fs.writeFileSync(filePathNovo, jsonContent);
            console.log('Arquivo Atualizado:', filePathNovo);
        } catch (error) {
            console.error('Erro ao atualizar arquivo:', error);
        }
    }
}
function read(arq){
    var caminhoArquivo = "./dados/"+arq
    if(!fs.existsSync(caminhoArquivo)){console.log("arquivo nao existe para ler")}
    else{
        try {
        // Ler o arquivo JSON de forma síncrona
            const dados = fs.readFileSync(caminhoArquivo, 'utf8');

            // Converter o conteúdo JSON para um objeto JavaScript
            const objeto = JSON.parse(dados);

            // Usar o objeto
            console.log(objeto);
        } catch (erro) {
            console.error('Erro ao ler o arquivo JSON:', erro);
        }
}}

function readAll(dir, callback){
    fs.readdir(dir, (erro, arquivos) => {
        if (erro) {
            return callback(erro);
        }

        // Verifica se arquivos é um array
        if (!Array.isArray(arquivos)) {
            return callback(new Error('Erro ao ler o diretório: Não é uma lista de arquivos'));
        }

        const arquivosJSON = arquivos.filter(arquivo => path.extname(arquivo) == '.json');
        let resultados = [];
        let pendentes = arquivosJSON.length;

        if (pendentes === 0) {
            return callback(null, resultados);
        }

        arquivosJSON.forEach(arquivo => {
            const caminhoArquivo = path.join(dir, arquivo);
            fs.readFile(caminhoArquivo, 'utf8', (erro, dados) => {
                if (erro) {
                    return callback(erro);
                }

                try {
                    const objeto = JSON.parse(dados);
                    resultados.push(objeto);
                } catch (parseErro) {
                    return callback(parseErro);
                }

                pendentes--;
                if (pendentes === 0) {
                    callback(null, resultados);
                }
            });
        });
    });
}
function find(dir, id, callback) {
    fs.readdir(dir, (erro, arquivos) => {
        if (erro) {
            return callback(erro);
        }

        // Verifica se arquivos é um array
        if (!Array.isArray(arquivos)) {
            return callback(new Error('Erro ao ler o diretório: Não é uma lista de arquivos'));
        }

        // Filtra os arquivos que começam com o ID e são arquivos JSON
        const arquivosFiltrados = arquivos.filter(arquivo => 
            arquivo.startsWith(id) && path.extname(arquivo) === '.json'
        );

        let resultados = [];
        let pendentes = arquivosFiltrados.length;

        if (pendentes === 0) {
            return callback(null, resultados);
        }

        arquivosFiltrados.forEach(arquivo => {
            const caminhoArquivo = path.join(dir, arquivo);
            fs.readFile(caminhoArquivo, 'utf8', (erro, dados) => {
                if (erro) {
                    return callback(erro);
                }

                try {
                    const objeto = JSON.parse(dados);
                    resultados.push({ nome: arquivo, conteudo: objeto });
                } catch (parseErro) {
                    return callback(parseErro);
                }

                pendentes--;
                if (pendentes === 0) {
                    callback(null, resultados);
                }
            });
        });
    });
}
function update(cpf, pago, num, atualiza, nomeArq, payload) {
    const dirPath = './dados';
    const filePathAnti = `${dirPath}/${nomeArq}.json`;
    let filePathNovo = `${dirPath}/${cpf}_${pago}_${num}.json`;

    // Verifica se o diretório existe
    if (!fs.existsSync(dirPath)) {
        console.log('Diretório não encontrado:', dirPath);
        return;
    }

    // Verifica se o arquivo existe
    if (fs.existsSync(filePathAnti)) {
        // Substitui o conteúdo do arquivo existente
        const jsonContent = JSON.stringify(payload, null, 2);
        fs.writeFileSync(filePathAnti, jsonContent);

        // Encontra um nome de arquivo único
        while (fs.existsSync(filePathNovo)) {
            num++;
            filePathNovo = `${dirPath}/${cpf}_${pago}_${num}.json`;
        }

        // Renomeia o arquivo existente
        fs.renameSync(filePathAnti, filePathNovo);
        console.log('Arquivo atualizado:', filePathNovo);
    } else {
        console.log('Arquivo não encontrado:', filePathAnti);
    }
}
function criarNomeArquivo() {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda se necessário
    const dia = String(dataAtual.getDate()).padStart(2, '0'); // Adiciona zero à esquerda se necessário
    const horas = String(dataAtual.getHours()).padStart(2, '0'); // Adiciona zero à esquerda se necessário
    const minutos = String(dataAtual.getMinutes()).padStart(2, '0'); // Adiciona zero à esquerda se necessário
    const segundos = String(dataAtual.getSeconds()).padStart(2, '0'); // Adiciona zero à esquerda se necessário

    const nomeArquivo = `${ano}${mes}${dia}_${horas}${minutos}${segundos}.xlsx`;
    return nomeArquivo;
}
function rmv(cpf, pago, file, nomeArq, obj,destino,origem){
    const nomeArqui = `${cpf}_${pago}_${file}.json`;
    const arquivoAtual = `./${origem}/${nomeArq}.json`;
    const novoDiretorio = `./${destino}/`;

    if (fs.existsSync(novoDiretorio + nomeArqui)) {
        rmv(cpf, pago, file + 1, nomeArq, obj,destino,origem);
    } else {
        // Modificando a linha desejada ("nomeArq")
        obj.nomeArq = `${cpf}_${pago}_${file}`;
        obj.dataDel = new Date().toLocaleDateString('pt-BR');
        // Convertendo o objeto JavaScript de volta para JSON
        const novoConteudo = JSON.stringify(obj, null, 2);

        // Salvando o arquivo modificado no novo diretório
        fs.writeFile(novoDiretorio + nomeArqui, novoConteudo, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo modificado:', err);
                return;
            }

            console.log('Arquivo movido e incluido no serasa:', novoDiretorio);
            // Removendo o arquivo original após salvar no novo diretório
            fs.unlink(arquivoAtual, (error) => {
                if (error) {
                    console.log('Erro ao remover o arquivo:', error);
                } else {
                    console.log('Arquivo removido com sucesso!');
                }
            });
        });
    }

}

function rmvPerm(ArquivoPath){
    fs.unlink(ArquivoPath, (error) => {
        if (error) {
            console.log('Erro ao remover o arquivo:', error);
        } else {
            console.log('Arquivo removido com sucesso!');
        }
    });
}

function exportar(obj,caminho){
    const worksheet = xlsx.utils.json_to_sheet(obj);

    // Cria um novo livro de trabalho
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Escreve o arquivo Excel
    xlsx.writeFile(workbook, `./export/${caminho}/${criarNomeArquivo()}`);

    console.log('Arquivo Excel criado com sucesso.');
}

function move(cpf, pago, file, nomeArq, obj) {
    const nomeArqui = `${cpf}_${pago}_${file}.json`;
    const arquivoAtual = `./dados/${nomeArq}.json`;
    const novoDiretorio = './pagos/';

    if (fs.existsSync(novoDiretorio + nomeArqui)) {
        move(cpf, pago, file + 1, nomeArq, obj);
    } else {
        // Modificando a linha desejada ("nomeArq")
        obj.nomeArq = `${cpf}_${pago}_${file}`;
        obj.dataInclusaoPagamento = new Date().toLocaleDateString('pt-BR');
        // Convertendo o objeto JavaScript de volta para JSON
        const novoConteudo = JSON.stringify(obj, null, 2);

        // Salvando o arquivo modificado no novo diretório
        fs.writeFile(novoDiretorio + nomeArqui, novoConteudo, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo modificado:', err);
                return;
            }

            console.log('Arquivo movido e modificado com sucesso para o novo diretório:', novoDiretorio);
            // Removendo o arquivo original após salvar no novo diretório
            fs.unlink(arquivoAtual, (error) => {
                if (error) {
                    console.log('Erro ao remover o arquivo:', error);
                } else {
                    console.log('Arquivo removido com sucesso!');
                }
            });
        });
    }
}
function moveSerasa(cpf, pago, file, nomeArq, obj,destino,origem) {
    const nomeArqui = `${cpf}_${pago}_${file}.json`;
    const arquivoAtual = `./${origem}/${nomeArq}.json`;
    const novoDiretorio = `./${destino}/`;

    if (fs.existsSync(novoDiretorio + nomeArqui)) {
        moveSerasa(cpf, pago, file + 1, nomeArq, obj,destino,origem);
    } else {
        // Modificando a linha desejada ("nomeArq")
        obj.nomeArq = `${cpf}_${pago}_${file}`;
        obj.inclusaoSerasa = new Date().toLocaleDateString('pt-BR');

        // Convertendo o objeto JavaScript de volta para JSON
        const novoConteudo = JSON.stringify(obj, null, 2);

        // Salvando o arquivo modificado no novo diretório
        fs.writeFile(novoDiretorio + nomeArqui, novoConteudo, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo modificado:', err);
                return;
            }

            console.log('Arquivo movido e incluido no serasa:', novoDiretorio);
            // Removendo o arquivo original após salvar no novo diretório
            fs.unlink(arquivoAtual, (error) => {
                if (error) {
                    console.log('Erro ao remover o arquivo:', error);
                } else {
                    console.log('Arquivo removido com sucesso!');
                }
            });
        });
    }
}
function removeSerasa(cpf, pago, file, nomeArq, obj,destino,origem) {
    const nomeArqui = `${cpf}_${pago}_${file}.json`;
    const arquivoAtual = `./${origem}/${nomeArq}.json`;
    const novoDiretorio = `./${destino}/`;

    if (fs.existsSync(novoDiretorio + nomeArqui)) {
        moveSerasa(cpf, pago, file + 1, nomeArq, obj,destino,origem);
    } else {
        // Modificando a linha desejada ("nomeArq")
        obj.nomeArq = `${cpf}_${pago}_${file}`;
        obj.dataDelecaoSerasa = new Date().toLocaleDateString('pt-BR');

        // Convertendo o objeto JavaScript de volta para JSON
        const novoConteudo = JSON.stringify(obj, null, 2);

        // Salvando o arquivo modificado no novo diretório
        fs.writeFile(novoDiretorio + nomeArqui, novoConteudo, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo modificado:', err);
                return;
            }

            console.log('Arquivo movido e incluido no serasa:', novoDiretorio);
            // Removendo o arquivo original após salvar no novo diretório
            fs.unlink(arquivoAtual, (error) => {
                if (error) {
                    console.log('Erro ao remover o arquivo:', error);
                } else {
                    console.log('Arquivo removido com sucesso!');
                }
            });
        });
    }
}

function recuperaArq(cpf, pago, file, nomeArq, obj,destino,origem){
    const nomeArqui = `${cpf}_${pago}_${file}.json`;
    const arquivoAtual = `./${origem}/${nomeArq}.json`;
    const novoDiretorio = `./${destino}/`;

    if (fs.existsSync(novoDiretorio + nomeArqui)) {
        recuperaArq(cpf, pago, file + 1, nomeArq, obj,destino,origem);
    } else {
        // Modificando a linha desejada ("nomeArq")
        obj.nomeArq = `${cpf}_${pago}_${file}`;
        // Convertendo o objeto JavaScript de volta para JSON
        const novoConteudo = JSON.stringify(obj, null, 2);

        // Salvando o arquivo modificado no novo diretório
        fs.writeFile(novoDiretorio + nomeArqui, novoConteudo, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo modificado:', err);
                return;
            }

            console.log('Arquivo movido e incluido no serasa:', novoDiretorio);
            // Removendo o arquivo original após salvar no novo diretório
            fs.unlink(arquivoAtual, (error) => {
                if (error) {
                    console.log('Erro ao remover o arquivo:', error);
                } else {
                    console.log('Arquivo removido com sucesso!');
                }
            });
        });
    }
}
module.exports = {add,rmv,read,readAll,find,update,exportar,findByContent,move,rmvPerm,moveSerasa,recuperaArq,getDataHoraAtual,removeSerasa}
