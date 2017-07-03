import { create } from 'rung-sdk';
import { OneOf, Double } from 'rung-sdk/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import { path, lt, gt, pipe, cond, equals, contains, __, T, concat } from 'ramda';
import { JSDOM } from 'jsdom';

const request = promisifyAgent(agent, Bluebird);

function render(card_titulo, col1_tit, col1_val, col2_tit, col2_val) {

    return (
		<div style="width:165px; height:125px; box-sizing: border-box; padding: 1px; overflow: hidden; position: absolute; margin: -12px 0 0 -10px; ">

			<div style="width:100%; height:20px; background-color: rgba(255,255,255,0.5); position: relative; z-index:1; ">
				<div style="background: url('http://www.pbanimado.com.br/rung/icon-milho.png') no-repeat center center; background-size: 100%; width:50px; height: 50px; position: absolute; z-index:2; margin: -10px 0 0 54px; border: 3px solid #FFF; -webkit-border-radius: 50%; -moz-border-radius: 50%; border-radius: 50%;"></div>
			</div>

			<div style="font-size:11px; width:96%; line-height: 1.3; text-align: center; padding: 30px 2% 0; ">
				<p style="margin:0; padding: 0; ">{card_titulo}</p>
				<p style="margin:0; padding: 0; ">{col1_tit}: {col1_val}</p>
				<p style="margin:0; padding: 0; ">{col2_tit}: <strong style="text-decoration: underline; ">{col2_val}</strong></p>
			</div>
		</div>
	);


}

function nodeListToArray(dom) {
    return Array.prototype.slice.call(dom, 0);
}

function returnSelector(type, row, cell) {
	const selector = '#content .middle .tables .cotacao:nth-child(1) .table-content table ';
	const selectorTable = type == 'title'
		? `thead > tr > th:nth-child(${cell})`
		: `tbody > tr:nth-child(${row}) > td:nth-child(${cell})`;
	return selector + selectorTable;
}

function main(context, done) {

	const { fonte, condicao, valor } = context.params;

	// variáveis padrão
	var fonte_titulo = '';
	var fonte_link = 'https://www.noticiasagricolas.com.br/cotacoes/leite/';
	var fonte_data = '#content .middle .tables .cotacao:nth-child(1) .info .fechamento';

	// variáveis das colunas de busca
	var coluna1_titulo = returnSelector('title', '', '1');
	var coluna1_result = returnSelector('result', '1', '1');

	var coluna2_titulo = returnSelector('title', '', '2');
	var coluna2_result = returnSelector('result', '1', '2');

	var coluna3_titulo = returnSelector('title', '', '3');
	var coluna3_result = returnSelector('result', '1', '3');

	// definindo os valores padrão de exibição
	var fonte_coluna_tit 	= coluna1_titulo;
	var fonte_coluna_res 	= coluna1_result;

	var fonte_preco_tit 	= coluna2_titulo;
	var fonte_preco_res 	= coluna2_result;

	var fonte_variacao_tit 	= coluna3_titulo;
	var fonte_variacao_res 	= coluna3_result;

	// definindo o link de conexão
	const server = pipe(
		cond([

			[equals('Indicador Cepea/Esalq - Milho'), () => 'indicador-cepea-esalq-milho'],

			[equals('Milho - BM&F (Pregão Regular)'), () => 'milho-bmf-pregao-regular'],

			[equals('Bolsa de Chicago - CME Group'), () => 'milho-bolsa-de-chicago-cme-group'],

			[equals('Milho - Média Campinas'), () => 'milho-media-campinas'],

			[contains(__, ['Mercado Físico - Não-Me-Toque/RS (Cotrijal)','Mercado Físico - Panambi/RS (Cotripal)','Mercado Físico - Ponta Grossa/PR (Coopagricola)','Mercado Físico - Ubiratã/PR (Cooagru)','Mercado Físico - Londrina/PR (Integrada)','Mercado Físico - Cascavel/PR (Coopavel)','Mercado Físico - Castro/PR (Castrolanda)','Mercado Físico - Pato Branco/PR (Coopertradição)','Mercado Físico - Palma Sola/SC (Coopertradição)','Mercado Físico - Rio do Sul/SC (Cravil)','Mercado Físico - Rondonópolis/MT (Samir Rosa Ass. Com.)','Mercado Físico - Primavera do Leste/MT (Samir Rosa Ass. Com.)','Mercado Físico - Alto Garças/MT (Samir Rosa Ass. Com.)','Mercado Físico - Itiquira/MT (Samir Rosa Ass. Com.)','Mercado Físico - Tangará da Serra/MT (Ceres)','Mercado Físico - Campo Novo do Parecis/MT (Ceres)','Mercado Físico - Sorriso/MT (Sindicato)','Mercado Físico - Jataí/GO (Sindicato)','Mercado Físico - Rio Verde/GO (Comigo)','Mercado Físico - Brasília/DF (Coopa-DF)','Mercado Físico - Campo Grande/MS (BCSP)','Mercado Físico - São Gabriel do Oeste/MS (Cooperoeste)','Mercado Físico - Oeste da Bahia (AIBA)','Mercado Físico - Luís Eduardo Magalhães/BA (Cooproeste)','Mercado Físico - Assis/SP (Coopermota)','Mercado Físico - Campinas/SP (BCSP)','Mercado Físico - Porto Paranaguá (Intertrading)']), () => 'milho-mercado-fisico-sindicatos-e-cooperativas'],

			[contains(__, ['Mercado Físico MS - Caarapó','Mercado Físico MS - Campo Grande','Mercado Físico MS - Chapadão do Sul','Mercado Físico MS - Dourados','Mercado Físico MS - Maracaju','Mercado Físico MS - Ponta Porã','Mercado Físico MS - São Gabriel do Oeste','Mercado Físico MS - Sidrolândia']), () => 'milho-mercado-fisico-ms'],

			[contains(__, ['Milho Disponível IMEA - Campo Verde','Milho Disponível IMEA - Canarana','Milho Disponível IMEA - Lucas do Rio Verde','Milho Disponível IMEA - Primavera do Leste','Milho Disponível IMEA - Rondonópolis','Milho Disponível IMEA - Tangará da Serra']), () => 'milho-disponivel-imea'],

			[equals('Prêmio Milho - Paranaguá/PR'), () => 'premio-milho-paranagua-pr'],

			[T, () => '']
		]),
		concat(fonte_link)
	)(fonte);

	// definindo os valores padrão
	switch (fonte) {


		case 'Indicador Cepea/Esalq - Milho':
			fonte_titulo 		= 'Indicador Cepea/Esalq - Milho';
			break;


		case 'Milho - BM&F (Pregão Regular)':
			fonte_titulo 		= 'Milho - BM&F (Pregão Regular)';
			break;


		case 'Bolsa de Chicago - CME Group':
			fonte_titulo 		= 'Bolsa de Chicago - CME Group';
			fonte_variacao_tit 	= returnSelector('title', '1', '4');
			fonte_variacao_res 	= returnSelector('result', '1', '4');
			break;


		case 'Milho - Média Campinas':
			fonte_titulo 		= 'Milho - Média Campinas';
			break;


		case 'Mercado Físico - Não-Me-Toque/RS (Cotrijal)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			break;

		case 'Mercado Físico - Panambi/RS (Cotripal)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Mercado Físico - Ponta Grossa/PR (Coopagricola)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Mercado Físico - Ubiratã/PR (Cooagru)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Mercado Físico - Londrina/PR (Integrada)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Mercado Físico - Cascavel/PR (Coopavel)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'Mercado Físico - Castro/PR (Castrolanda)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;

		case 'Mercado Físico - Pato Branco/PR (Coopertradição)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
			break;

		case 'Mercado Físico - Palma Sola/SC (Coopertradição)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '9', '1');
			fonte_preco_res 	= returnSelector('result', '9', '2');
			fonte_variacao_res 	= returnSelector('result', '9', '3');
			break;

		case 'Mercado Físico - Rio do Sul/SC (Cravil)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '10', '1');
			fonte_preco_res 	= returnSelector('result', '10', '2');
			fonte_variacao_res 	= returnSelector('result', '10', '3');
			break;

		case 'Mercado Físico - Rondonópolis/MT (Samir Rosa Ass. Com.)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '11', '1');
			fonte_preco_res 	= returnSelector('result', '11', '2');
			fonte_variacao_res 	= returnSelector('result', '11', '3');
			break;

		case 'Mercado Físico - Primavera do Leste/MT (Samir Rosa Ass. Com.)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '12', '1');
			fonte_preco_res 	= returnSelector('result', '12', '2');
			fonte_variacao_res 	= returnSelector('result', '12', '3');
			break;

		case 'Mercado Físico - Alto Garças/MT (Samir Rosa Ass. Com.)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '13', '1');
			fonte_preco_res 	= returnSelector('result', '13', '2');
			fonte_variacao_res 	= returnSelector('result', '13', '3');
			break;

		case 'Mercado Físico - Itiquira/MT (Samir Rosa Ass. Com.)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '14', '1');
			fonte_preco_res 	= returnSelector('result', '14', '2');
			fonte_variacao_res 	= returnSelector('result', '14', '3');
			break;

		case 'Mercado Físico - Tangará da Serra/MT (Ceres)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '15', '1');
			fonte_preco_res 	= returnSelector('result', '15', '2');
			fonte_variacao_res 	= returnSelector('result', '15', '3');
			break;

		case 'Mercado Físico - Campo Novo do Parecis/MT (Ceres)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '16', '1');
			fonte_preco_res 	= returnSelector('result', '16', '2');
			fonte_variacao_res 	= returnSelector('result', '16', '3');
			break;

		case 'Mercado Físico - Sorriso/MT (Sindicato)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '17', '1');
			fonte_preco_res 	= returnSelector('result', '17', '2');
			fonte_variacao_res 	= returnSelector('result', '17', '3');
			break;

		case 'Mercado Físico - Jataí/GO (Sindicato)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '18', '1');
			fonte_preco_res 	= returnSelector('result', '18', '2');
			fonte_variacao_res 	= returnSelector('result', '18', '3');
			break;

		case 'Mercado Físico - Rio Verde/GO (Comigo)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '19', '1');
			fonte_preco_res 	= returnSelector('result', '19', '2');
			fonte_variacao_res 	= returnSelector('result', '19', '3');
			break;

		case 'Mercado Físico - Brasília/DF (Coopa-DF)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '20', '1');
			fonte_preco_res 	= returnSelector('result', '20', '2');
			fonte_variacao_res 	= returnSelector('result', '20', '3');
			break;

		case 'Mercado Físico - Campo Grande/MS (BCSP)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '21', '1');
			fonte_preco_res 	= returnSelector('result', '21', '2');
			fonte_variacao_res 	= returnSelector('result', '21', '3');
			break;

		case 'Mercado Físico - São Gabriel do Oeste/MS (Cooperoeste)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '22', '1');
			fonte_preco_res 	= returnSelector('result', '22', '2');
			fonte_variacao_res 	= returnSelector('result', '22', '3');
			break;

		case 'Mercado Físico - Oeste da Bahia (AIBA)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '23', '1');
			fonte_preco_res 	= returnSelector('result', '23', '2');
			fonte_variacao_res 	= returnSelector('result', '23', '3');
			break;

		case 'Mercado Físico - Luís Eduardo Magalhães/BA (Cooproeste)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '24', '1');
			fonte_preco_res 	= returnSelector('result', '24', '2');
			fonte_variacao_res 	= returnSelector('result', '24', '3');
			break;

		case 'Mercado Físico - Assis/SP (Coopermota)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '25', '1');
			fonte_preco_res 	= returnSelector('result', '25', '2');
			fonte_variacao_res 	= returnSelector('result', '25', '3');
			break;

		case 'Mercado Físico - Campinas/SP (BCSP)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '26', '1');
			fonte_preco_res 	= returnSelector('result', '26', '2');
			fonte_variacao_res 	= returnSelector('result', '26', '3');
			break;

		case 'Mercado Físico - Porto Paranaguá (Intertrading)':
			fonte_titulo 		= 'Milho - Mercado Físico';
			fonte_coluna_res 	= returnSelector('result', '27', '1');
			fonte_preco_res 	= returnSelector('result', '27', '2');
			fonte_variacao_res 	= returnSelector('result', '27', '3');
			break;



		case 'Mercado Físico MS - Caarapó':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			break;

		case 'Mercado Físico MS - Campo Grande':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Mercado Físico MS - Chapadão do Sul':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Mercado Físico MS - Dourados':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Mercado Físico MS - Maracaju':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Mercado Físico MS - Ponta Porã':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;

		case 'Mercado Físico MS - São Gabriel do Oeste':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			fonte_coluna_res 	= returnSelector('result', '7', '1');
			fonte_preco_res 	= returnSelector('result', '7', '2');
			fonte_variacao_res 	= returnSelector('result', '7', '3');
			break;

		case 'Mercado Físico MS - Sidrolândia':
			fonte_titulo 		= 'Milho - Mercado Físico - MS';
			fonte_coluna_res 	= returnSelector('result', '8', '1');
			fonte_preco_res 	= returnSelector('result', '8', '2');
			fonte_variacao_res 	= returnSelector('result', '8', '3');
			break;



		case 'Milho Disponível IMEA - Campo Verde':
			fonte_titulo 		= 'Milho Disponível - IMEA';
			break;

		case 'Milho Disponível IMEA - Canarana':
			fonte_titulo 		= 'Milho Disponível - IMEA';
			fonte_coluna_res 	= returnSelector('result', '2', '1');
			fonte_preco_res 	= returnSelector('result', '2', '2');
			fonte_variacao_res 	= returnSelector('result', '2', '3');
			break;

		case 'Milho Disponível IMEA - Lucas do Rio Verde':
			fonte_titulo 		= 'Milho Disponível - IMEA';
			fonte_coluna_res 	= returnSelector('result', '3', '1');
			fonte_preco_res 	= returnSelector('result', '3', '2');
			fonte_variacao_res 	= returnSelector('result', '3', '3');
			break;

		case 'Milho Disponível IMEA - Primavera do Leste':
			fonte_titulo 		= 'Milho Disponível - IMEA';
			fonte_coluna_res 	= returnSelector('result', '4', '1');
			fonte_preco_res 	= returnSelector('result', '4', '2');
			fonte_variacao_res 	= returnSelector('result', '4', '3');
			break;

		case 'Milho Disponível IMEA - Rondonópolis':
			fonte_titulo 		= 'Milho Disponível - IMEA';
			fonte_coluna_res 	= returnSelector('result', '5', '1');
			fonte_preco_res 	= returnSelector('result', '5', '2');
			fonte_variacao_res 	= returnSelector('result', '5', '3');
			break;

		case 'Milho Disponível IMEA - Tangará da Serra':
			fonte_titulo 		= 'Milho Disponível - IMEA';
			fonte_coluna_res 	= returnSelector('result', '6', '1');
			fonte_preco_res 	= returnSelector('result', '6', '2');
			fonte_variacao_res 	= returnSelector('result', '6', '3');
			break;



		case 'Prêmio Milho - Paranaguá/PR':
			fonte_titulo 		= 'Prêmio Milho - Paranaguá/PR';
			break;


	}

	// Obter todo o HTML do site em modo texto
	return request.get(server).then(({ text }) => {

		// Virtualizar o DOM do texto
		const { window } = new JSDOM(text);

		// Converter os dados da tabela para uma lista
		const retorno_data 			= window.document.querySelector(fonte_data).innerHTML;
		const retorno_coluna_tit 	= window.document.querySelector(fonte_coluna_tit).innerHTML;
		const retorno_coluna_res 	= window.document.querySelector(fonte_coluna_res).innerHTML;
		const retorno_preco_tit 	= window.document.querySelector(fonte_preco_tit).innerHTML;
		const retorno_preco_res 	= window.document.querySelector(fonte_preco_res).innerHTML;
		const retorno_variacao_tit 	= window.document.querySelector(fonte_variacao_tit).innerHTML;
		const retorno_variacao_res 	= window.document.querySelector(fonte_variacao_res).innerHTML;

		// arrumando o valor que vem do HTML
		var valorHTML = parseFloat(retorno_preco_res.replace(',', '.'));

		// arrumando o valor que é digitado
		var valorFormatado = valor.toFixed(2);

		// formatando comentario
		var comentario = "<p style='font-weight: bold; font-size: 18px; '>Cotação do Milho</p><p style='font-weight: bold; font-size: 18px; '>" + fonte_titulo + "</p><hr><p style='font-size: 16px; font-weight: bold; '>" + retorno_data + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_coluna_tit + "</span>: " + retorno_coluna_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_preco_tit + "</span>: " + retorno_preco_res + "</p><p style='font-size: 16px; '><span style='font-weight: bold; '>" + retorno_variacao_tit + "</span>: " + retorno_variacao_res + "</p><br><p style='font-size: 16px; '>Fonte: Portal Notícias Agrícolas</p><a href='" + server + "' target='_blank' style='font-size: 14px; font-style: italic; '>http://www.noticiasagricolas.com.br</a>";

		console.log(comentario);

		// verificação de maior OU menor
		if ((condicao == 'maior' && valorHTML > valor) || (condicao == 'menor' && valorHTML < valor)) {

			done({
				alerts: {
					[`milho${fonte_titulo}`] : {
						title: fonte_titulo,
						content: render(fonte_titulo, retorno_coluna_tit, retorno_coluna_res, retorno_preco_tit, retorno_preco_res),
						comment: comentario
					}
				}
			});

		} else {

			done({ alerts: {} });

		}
	})
	.catch(() => done({ alerts: {} }));

}

const lista_fontes = [

	'Indicador Cepea/Esalq - Milho',
	'Milho - BM&F (Pregão Regular)',
	'Bolsa de Chicago - CME Group',
	'Milho - Média Campinas',
	'Mercado Físico - Não-Me-Toque/RS (Cotrijal)',
	'Mercado Físico - Panambi/RS (Cotripal)',
	'Mercado Físico - Ponta Grossa/PR (Coopagricola)',
	'Mercado Físico - Ubiratã/PR (Cooagru)',
	'Mercado Físico - Londrina/PR (Integrada)',
	'Mercado Físico - Cascavel/PR (Coopavel)',
	'Mercado Físico - Castro/PR (Castrolanda)',
	'Mercado Físico - Pato Branco/PR (Coopertradição)',
	'Mercado Físico - Palma Sola/SC (Coopertradição)',
	'Mercado Físico - Rio do Sul/SC (Cravil)',
	'Mercado Físico - Rondonópolis/MT (Samir Rosa Ass. Com.)',
	'Mercado Físico - Primavera do Leste/MT (Samir Rosa Ass. Com.)',
	'Mercado Físico - Alto Garças/MT (Samir Rosa Ass. Com.)',
	'Mercado Físico - Itiquira/MT (Samir Rosa Ass. Com.)',
	'Mercado Físico - Tangará da Serra/MT (Ceres)',
	'Mercado Físico - Campo Novo do Parecis/MT (Ceres)',
	'Mercado Físico - Sorriso/MT (Sindicato)',
	'Mercado Físico - Jataí/GO (Sindicato)',
	'Mercado Físico - Rio Verde/GO (Comigo)',
	'Mercado Físico - Brasília/DF (Coopa-DF)',
	'Mercado Físico - Campo Grande/MS (BCSP)',
	'Mercado Físico - São Gabriel do Oeste/MS (Cooperoeste)',
	'Mercado Físico - Oeste da Bahia (AIBA)',
	'Mercado Físico - Luís Eduardo Magalhães/BA (Cooproeste)',
	'Mercado Físico - Assis/SP (Coopermota)',
	'Mercado Físico - Campinas/SP (BCSP)',
	'Mercado Físico - Porto Paranaguá (Intertrading)',
	'Mercado Físico MS - Caarapó',
	'Mercado Físico MS - Campo Grande',
	'Mercado Físico MS - Chapadão do Sul',
	'Mercado Físico MS - Dourados',
	'Mercado Físico MS - Maracaju',
	'Mercado Físico MS - Ponta Porã',
	'Mercado Físico MS - São Gabriel do Oeste',
	'Mercado Físico MS - Sidrolândia',
	'Milho Disponível IMEA - Campo Verde',
	'Milho Disponível IMEA - Canarana',
	'Milho Disponível IMEA - Lucas do Rio Verde',
	'Milho Disponível IMEA - Primavera do Leste',
	'Milho Disponível IMEA - Rondonópolis',
	'Milho Disponível IMEA - Tangará da Serra',
	'Prêmio Milho - Paranaguá/PR'

];

const params = {
    fonte: {
        description: _('Informe a fonte que você deseja ser informado: '),
        type: OneOf(lista_fontes),
		required: true
    },
	condicao: {
		description: _('Informe a condição (maior, menor): '),
		type: OneOf(['maior', 'menor']),
		default: 'maior'
	},
	valor: {
		description: _('Informe o valor em reais para verificação: '),
		type: Double,
		required: true
	}
};

export default create(main, {
    params,
    primaryKey: true,
    title: _("Cotação Milho"),
    description: _("Acompanhe a cotação do milho em diversas praças."),
	preview: render('Milho - Mercado Físico', 'Praça', 'Londrina/PR (Integrada)', 'Preço (R$/sc 60kg)', '17,70')
});