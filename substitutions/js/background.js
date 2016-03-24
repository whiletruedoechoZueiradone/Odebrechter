//Default replacements
var default_replacements = [
  //http://g1.globo.com/politica/operacao-lava-jato/noticia/2016/03/planilhas-da-odebrecht-trazem-codinomes-e-valores-vultosos-diz-pf.html
  ['Marcelo Marques Cassimiro', 'Cobra'],
  ['Andre Agostinho', 'Galego'],
  ['Agustini Moreno', 'Galego'],
  ['Maria Prado Ribeiro de Lavor', 'Amiga'],
  ['Rogerio Martins', 'Baixinho'],
  ['Andre Luiz de Oliveira', 'Timão'],
  ['Nilton Coelho', 'Varejão'],
  ['Fernando Borin Graziano', 'Kafta'],
  ['Sergio Rodrigues de Souza Vaz', 'Padeiro'],
  ['Elisabeth Oliveira', 'Grisalhão'],
  ['Bruno Martins Gonçalves Ferreira', 'Coxa'],
  ['Luiz Apolonio Neto', 'Professor'],
  ['Olivia Vieira', 'Proximus'],
  ['Junior da CBTU', 'Pequi'],
  ['Douglas Franzoni Rodrigues', 'Las Vegas'],
  
  // http://www.otempo.com.br/capa/pol%C3%ADtica/veja-a-lista-dos-apelidos-dos-pol%C3%ADticos-na-lista-da-odebrecht-1.1265445
  ['Manuela D\'Avila', 'Avião'],
  ['Marcelo Nilo', 'Rio'],
  ['Edvaldo Brito', 'Candomblé'],
  ['Daniel Almeida', 'Comuna'],
  ['Paulo Magalhães', 'Goleiro'],
  ['Raul Jungmann', 'Bruto'],
  ['Geraldo Júlio', 'Neto'],
  ['Etore Labanca', 'Cacique'],
  ['Fabio Branco', 'Colorido'],
  ['Mário Kertesz', 'Roberval'],
  ['Artur Maia', 'Tuca'],
  ['Jarbas Vasconcelos Filho', 'Viagra'],
  ['Renan Calheiros', 'Atleta'],
  ['José Sarney', 'Escritor'],
  ['Eduardo Paes', 'Nervosinho'],
  ['Sergio Cabral', 'Proximus'],
  ['Eduardo Cunha', 'Caranguejo'],
  ['Jorge Picciani', 'Grego'],
  ['Adão Villaverde', 'Eva'],
  ['Carlos Todeschini', 'Alemão'],
  ['Tarcísio Zimmermann', 'Irmão'],
  ['Jairo Jorge', 'Nordeste'],
  ['Nelson Pelegrino', 'Pelé'],
  ['Humberto Costa', 'Drácula'],
  ['Pedro Eugênio', 'Droeu'],
  ['Paulo Garcia', 'Pastor'],
  ['Lindberg Farias', 'Lindinho'],
  ['Lindbergh Farias', 'Lindinho'],
  //http://www1.folha.uol.com.br/poder/2016/03/1753226-pf-acha-planilha-de-pagamentos-da-odebrecht-para-politicos.shtml
  ['Jaques Wagner', 'Passivo'],
  ['Cid Gomes', 'Falso'],
  ['Randolfo', 'Múmia'],
  ['Randolfe Rodrigues', 'Múmia'],
  ['Raimundo Colombo', 'Ovo'],
  ['Manuela d\'Ávila', 'Avião'],
  ['Cunha', 'Caranguejo'],
  ['Sebastião Almeida', 'Sumido']
];
//Default Blacklist
var default_blacklisted_sites = [
  "docs.google.com",
  "gmail.com",
  "mail.google.com",
  "inbox.google.com",
  "mail.yahoo.com",
  "outlook.com",
  "xkcd.com"
];

var debug = false;

function checkBlackList(url, blacklist) {
  url = url.toLowerCase() || "";
  blacklist = blacklist || [];
  for (var i = blacklist.length - 1; i >= 0; i--) {
    if (url.indexOf(blacklist[i]) > -1) {
      return false;
    }
  }
  return true;
}

function injectionScript(tabId, info, tab) {
  if (debug) {console.log("injection fire");}
  chrome.storage.sync.get(null, function (result) {
    if (result
        && result["status"] === "enabled"
        && checkBlackList(tab.url, result['blacklist'])) {
      chrome.tabs.executeScript(tabId, {
        file: "js/substitutions.js",
        runAt: "document_end"
      }, function (){
        if (debug){console.log('Script Executed');}
      });
    }
  });
}

function addMessage(request, sender, sendResponse) {
  if (debug) { console.log("message fire"); }
  chrome.storage.sync.get(null, function(result) {
    if (request === "config" && result["replacements"]) {
      sendResponse(result["replacements"]);
    }
  });
  return true;
}

function fixDataCorruption() {
  if (debug) { console.log("updateStore"); }
  chrome.storage.sync.get(null, function(result) {
    if (!result["status"]) {
      chrome.storage.sync.set({
        "status": "enabled"
      });
    }
    if (!result["replacements"]) {
      chrome.storage.sync.set({
        "replacements": default_replacements
      });
    }
    if (!result["blacklist"]) {
      chrome.storage.sync.set({
        "blacklist": default_blacklisted_sites
      });
    }
  });
}

function toggleActive() {
  if (debug) { console.log("clickfire"); }
  chrome.storage.sync.get("status", function(result) {
    if (result["status"] === null) {
      status = "enabled";
    } else {
      status = result["status"];
    }
    if (status === "enabled") {
      icon = {
        "path": "images/disabled.png"
      };
      message = {
        "title": "clique para habilitar a substituição de codinomes..."
      };
      status = "disabled";
    } else if (status === "disabled") {
      icon = {
        "path": "images/enabled.png"
      };
      message = {
        "title": "clique para desabilitar a substituição de codinomes..."
      };
      status = "enabled";
    }
    chrome.browserAction.setIcon(icon);
    chrome.browserAction.setTitle(message);
    chrome.storage.sync.set({
      "status": status
    });
  });
}

chrome.browserAction.onClicked.addListener(toggleActive);
chrome.runtime.onMessage.addListener(addMessage);
chrome.tabs.onUpdated.addListener(injectionScript);
chrome.runtime.onInstalled.addListener(fixDataCorruption);
chrome.runtime.onStartup.addListener(fixDataCorruption);
