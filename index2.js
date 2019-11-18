const request = require('request-promise');
const cheerio = require('cheerio');
const {Parser} = require('json2csv');
const fs = require('fs');

URL =  'http://www2.aneel.gov.br/scg/gd/VerGD.asp?pagina=1&acao=buscar&login=&NomPessoa=&IdAgente=&DatConexaoInicio=&DatConexaoFim='

request(URL)
    .then(function(html){

      let pages = cheerio(".tabelaMaior:nth-child(6)",html).text().replace(/\s+/g," ");
      const pages_number = pages.split(' ');
      const total_pages = pages_number.length - 3
      // console.log(total_pages)
    
      // Loop pages
      for (let i = 0; i < 1; i++) {
        const urlPage = `http://www2.aneel.gov.br/scg/gd/VerGD.asp?pagina=${1}&acao=buscar&login=&NomPessoa=&IdAgente=&DatConexaoInicio=&DatConexaoFim=`;
        request(urlPage)
          .then(function(html){
            // Fazer lool eq(0 a 1000)
            let listarDados = [];
            for (let i = 0; i < 1000; i++) {
              let distribuidora = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(1)").eq(i).text().replace(/\s+/g," ");
              let codigo = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(2)").eq(i).text().replace(/\s+/g," ");
              let titular = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(3)").eq(i).text().replace(/\s+/g," ");
              let classe = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(4)").eq(i).text().replace(/\s+/g," ");
              let subGrupo = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(5)").eq(i).text().replace(/\s+/g," ");
              let modalidade = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(6)").eq(i).text().replace(/\s+/g," ");
              let qtdUcs = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(7)").eq(i).text().replace(/\s+/g," ");
              let municipio = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(8)").eq(i).text().replace(/\s+/g," ");
              let uf = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(9)").eq(i).text().replace(/\s+/g," ");
              let cep = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(10)").eq(i).text().replace(/\s+/g," ");
              let data = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(11)").eq(i).text().replace(/\s+/g," ");
              let tipo = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(12)").eq(i).text().replace(/\s+/g," ");
              let fonte = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(13)").eq(i).text().replace(/\s+/g," ");
              let potencia = cheerio(".tabelaMaior:nth-child(7)",html).find(".linhaBranca:nth-child(14)").eq(i).text().replace(/\s+/g," ");
          
              listarDados.push({
                distribuidora,
                codigo,
                titular,
                classe,
                subGrupo,
                modalidade,
                qtdUcs,
                municipio,
                uf,
                cep,
                data,
                tipo,
                fonte,
                potencia
              });
            }
            console.log(listarDados)
            const json2csvParser = new Parser()
            const csv = json2csvParser.parse(listarDados)
            console.log(csv);
            fs.writeFileSync('./dados-ucs.csv', csv, 'utf-8')
          })
          .catch(function(err){
            //handle error
            console.log(err)
          });
      }

    })
    .catch(function(err){
      //handle error
      console.log(err)
    });
