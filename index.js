const request = require('request-promise');
const cheerio = require('cheerio');
const {Parser} = require('json2csv');
const fs = require('fs');

let listData = []
// Loop pages
for (let i = 0; i < 1; i++) {
  URL =  `http://www2.aneel.gov.br/scg/gd/VerGD.asp?pagina=${i+1}&acao=buscar&login=&NomPessoa=&IdAgente=&DatConexaoInicio=01/01/2000&DatConexaoFim=31/10/2019`

  const fetchPage = async (url, n) => {
    try {
        const result = await request(url)
      // console.log(result)
      return result;
      } catch(err) {
          if (n === 0) throw err;

          console.log("fetchPage(): Waiting For 3 seconds before retrying the request.")
      await waitFor(3000);
          console.log(`Request Retry Attempt Number: ${7 - n} ====> URL: ${url}`)
          return await fetchPage(url, n - 1);
      }
  };

  // Função responsavel para pegar dados
  async function getData(){
    const requisicao = await fetchPage(URL, 6);
    let $ =  cheerio.load(requisicao);

    const listUc = $('.tabelaMaior:nth-child(7)').each( async (index, element) => {

      for (let i = 0; i < 600; i++) {
        let distribuidora = $(element).find(".linhaBranca:nth-child(1)").eq(i).text().replace(/\s+/g," ");
        let codigo = $(element).find(".linhaBranca:nth-child(2)").eq(i).text().replace(/\s+/g," ");
        let titular = $(element).find(".linhaBranca:nth-child(3)").eq(i).text().replace(/\s+/g," ");
        let classe = $(element).find(".linhaBranca:nth-child(4)").eq(i).text().replace(/\s+/g," ");
        let subGrupo = $(element).find(".linhaBranca:nth-child(5)").eq(i).text().replace(/\s+/g," ");
        let modalidade = $(element).find(".linhaBranca:nth-child(6)").eq(i).text().replace(/\s+/g," ");
        let qtdUcs = $(element).find(".linhaBranca:nth-child(7)").eq(i).text().replace(/\s+/g," ");
        let municipio = $(element).find(".linhaBranca:nth-child(8)").eq(i).text().replace(/\s+/g," ");
        let uf = $(element).find(".linhaBranca:nth-child(9)").eq(i).text().replace(/\s+/g," ");
        let cep = $(element).find(".linhaBranca:nth-child(10)").eq(i).text().replace(/\s+/g," ");
        let data = $(element).find(".linhaBranca:nth-child(11)").eq(i).text().replace(/\s+/g," ");
        let tipo = $(element).find(".linhaBranca:nth-child(12)").eq(i).text().replace(/\s+/g," ");
        let fonte = $(element).find(".linhaBranca:nth-child(13)").eq(i).text().replace(/\s+/g," ");
        let potencia = $(element).find(".linhaBranca:nth-child(14)").eq(i).text().replace(/\s+/g," ");
    
        listData.push({
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
      const json2csvParser = new Parser()
      const csv = json2csvParser.parse(listData)
      console.log(csv);
      fs.writeFileSync('./dados-ucs.csv', csv, 'utf-8') 

    }).get();  
    return Promise.all(listUc);  
  }
  console.log(getData())
}
