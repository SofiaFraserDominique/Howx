const express = require('express');//npm install express
const mysql = require('mysql2');//npm install mysql

const app = express();
app.listen(80);

const MYSQL_IP= "localhost";
const MYSQL_LOGIN= "root";
const MYSQL_PASSWORD= "goiaba123";

let con = mysql.createConnection({
  host:  MYSQL_IP,
  user: MYSQL_LOGIN,
  password: MYSQL_PASSWORD,
  database: "teste01"
});

con.connect(function(err) {
  if (err){
    console.log(err);
    throw err;
  }
  console.log("Connection with mysql established");
});
let valoresDosImoveisSomados
let VendasDoMes
let percentual
let idIvenda = " select * from venda;"
let sql = `select a.id_Venda, a.data_do_Pagamento, a.valor_Do_Pagamento, b.codigo_Imovel, b.descricao_Imovel, c.Tipo_Imovel from venda a, imovel b, tipo_imovel c where a.codigo_Imovel = b.codigo_Imovel and b.cod_TipoImovel = c.cod_TipoImovel;`;

let print = console.log

function SomaValoresImoveis (list ){
  let codigos_Imovel = list.map(el => el.codigo_Imovel );
  const valoresUnicos = {};

  const arraySemDuplicados = codigos_Imovel.filter((valor) => {
   if (!valoresUnicos[valor]) {
     valoresUnicos[valor] = true;
     return true;
   }
   return false;
 });

  let newlist = []
  arraySemDuplicados.forEach ( record => { 
  let soma =  list.reduce((acc, current)  => {
   if (Number(current.codigo_Imovel ) === Number(record)) {
     return acc +  Number(current.valor_Do_Pagamento); 
   }
   return acc;
 }, 0);
 newlist.push(  {id :record, Valor :soma})
})
 //console.log(newlist)
 return newlist
}

function TotalVendasPorMes(list){
  let NewList = {};
  list.forEach (dado =>{
    const data = new Date(dado.data_do_Pagamento.toString());
    const ano = data.getFullYear();
    const mes = data.getMonth() + 1; 
    let newdata = `${mes}/${ano}`;
   // print(newdata) 
 
    if (NewList[newdata]) {
      NewList[newdata] +=  Number(dado.valor_Do_Pagamento);
      }else{
        NewList[newdata] =  Number(dado.valor_Do_Pagamento);
      }
  });
  return NewList;
}

function percentualVendas_TipoImovel(list){
  let casas = list.filter(dado => dado.Tipo_Imovel === "Casa");
  let ValorCasas = casas.reduce((acc, current) => acc+ Number(current.valor_Do_Pagamento), 0 )
  print(ValorCasas )
  let apartamentos = list.filter(dado => dado.Tipo_Imovel === "Apartamento");
  let Valorapartamentos = apartamentos.reduce((acc, current) => acc+ Number(current.valor_Do_Pagamento), 0 )
  print(Valorapartamentos )
  let salas_Comerciais = list.filter(dado => dado.Tipo_Imovel === "Sala Comercial");
  let Valorasalas_Comerciais = salas_Comerciais.reduce((acc, current) => acc+ Number(current.valor_Do_Pagamento), 0 )
  print(Valorasalas_Comerciais )

  const total = Valorapartamentos + ValorCasas + Valorasalas_Comerciais;

  const porcentagemApartamento = (Valorapartamentos / total) * 100;
  const porcentagemCasa = (ValorCasas / total) * 100;
  const porcentagemSalaComercial = (Valorasalas_Comerciais / total) * 100;
  print(porcentagemApartamento,porcentagemCasa, porcentagemSalaComercial )
  return { Casa:porcentagemCasa, Apartamentos:porcentagemApartamento, Sala_Comercial:porcentagemSalaComercial  }
}


con.query(idIvenda, function (err, result) {
    if (err){
      print(err)
      res.status(500);
      res.send(JSON.stringify(err));
    }else{
       valoresDosImoveisSomados =  SomaValoresImoveis(result)
       VendasDoMes = TotalVendasPorMes(result)
      // percentualVendas_TipoImovel(sql)
    } 

 
});

con.query(sql, function (err, result) {
  if (err){
    print(err)
    res.status(500);
    res.send(JSON.stringify(err));
  }else{
    //print(result)
    percentual = percentualVendas_TipoImovel(result)
    print(percentual)
  } 


});
app.get('/get_valores_dos_imoveis_somados', function (req, res) {
  res.status(200);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS,PUT,DELETE,HEAD");
  res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Origin,X-Requested-With,Content-Type,Accept");
  res.setHeader("Access-Control-Max-Age","1728000");
  res.send(JSON.stringify(valoresDosImoveisSomados));
})
app.get('/get_vendas_do_mes', function (req, res) {
  res.status(200);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS,PUT,DELETE,HEAD");
  res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Origin,X-Requested-With,Content-Type,Accept");
  res.setHeader("Access-Control-Max-Age","1728000");
  res.send(JSON.stringify(VendasDoMes));
})

app.get('/get_percentual_vendas', function (req, res) {
  res.status(200);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods","POST,GET,OPTIONS,PUT,DELETE,HEAD");
  res.setHeader("Access-Control-Allow-Headers","X-PINGOTHER,Origin,X-Requested-With,Content-Type,Accept");
  res.setHeader("Access-Control-Max-Age","1728000");
  res.send(JSON.stringify(percentual));
})


