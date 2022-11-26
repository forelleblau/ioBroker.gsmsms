'use strict';

if (typeof goog !== 'undefined') {
  goog.provide('Blockly.JavaScript.Sendto');

  goog.require('Blockly.JavaScript');
}

// remove it somewhere, because it defined in javascript=>blocks_words.js from javascript>=4.6.0
Blockly.Translate = Blockly.Translate || function(word, lang) {
  lang = lang || systemLang;
  if (Blockly.Words && Blockly.Words[word]) {
    return Blockly.Words[word][lang] || Blockly.Words[word].en;
  } else {
    return word;
  }
};

// --- SendTo telegram --------------------------------------------------
Blockly.Words['gsmsms'] = {
  'en': 'SMS (gsmsms)',
  'pt': 'SMS (gsmsms)',
  'pl': 'SMS (gsmsms)',
  'nl': 'SMS (gsmsms)',
  'it': 'SMS (gsmsms)',
  'es': 'SMS (gsmsms)',
  'fr': 'SMS (gsmsms)',
  'de': 'SMS (gsmsms)',
  'ru': 'SMS (gsmsms)'
};
Blockly.Words['gsmsms_message'] = {
  'en': 'Message',
  'pt': 'Mensagem',
  'pl': 'Wiadomość',
  'nl': 'Bericht',
  'it': 'Messaggio',
  'es': 'Mensaje',
  'fr': 'Message',
  'de': 'Nachricht',
  'ru': 'Cообщение'
};
Blockly.Words['gsmsms_recipient'] = {
  "en": "Recipient (number)",
  "de": "Empfänger (Nummer)",
  "ru": "Получатель (номер)",
  "pt": "Recipiente (número)",
  "nl": "Recipiënt (number)",
  "fr": "Bénéficiaire (numéro)",
  "it": "Recipiente (numero)",
  "es": "Recipiente (número)",
  "pl": "Recipient (liczba)",
  "zh-cn": "核准(编号)"
};
Blockly.Words['gsmsms_alert'] = {
  "en": "alert",
  "de": "Alarm",
  "ru": "оповещение",
  "pt": "alerta",
  "nl": "alarm",
  "fr": "alerte",
  "it": "avviso",
  "es": "alerta",
  "pl": "alarm",
  "zh-cn": "警觉"
};
Blockly.Words['gsmsms_anyInstance'] = {
  'en': 'all instances',
  'pt': 'todas as instâncias',
  'pl': 'wszystkie przypadki',
  'nl': 'alle instanties',
  'it': 'tutte le istanze',
  'es': 'todas las instancias',
  'fr': 'toutes les instances',
  'de': 'Alle Instanzen',
  'ru': 'На все драйвера'
};
Blockly.Words['gsmsms_tooltip'] = {
  "en": "Send message (SMS)",
  "de": "Nachricht senden (SMS)",
  "ru": "Отправить сообщение (SMS)",
  "pt": "Enviar mensagem (SMS)",
  "nl": "Stuur bericht (SMS)",
  "fr": "Envoyer un message (SMS)",
  "it": "Invia messaggio (SMS)",
  "es": "Enviar mensaje (SMS)",
  "pl": "SMS (ang.)",
  "zh-cn": "简讯"
};
Blockly.Words['gsmsms_help'] = {
  'en': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'pt': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'pl': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'nl': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'it': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'es': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'fr': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'de': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md',
  'ru': 'https://github.com/forelleblau/ioBroker.gsmsms/blob/master/README.md'
};
Blockly.Sendto.blocks['gsmsms'] =
  '<block type="gsmsms">' +
  '     <value name="RECIPIENT">' +
  '       <shadow type = "text" > ' +
  '            <field name="TEXT">text</field>' +
  '       </shadow>' +
  '     </value>' +
  '     <value name="MESSAGE">' +
  '         <shadow type="text">' +
  '             <field name="TEXT">text</field>' +
  '         </shadow>' +
  '     </value>' +
  '     <value name="ALERT">' +
  '     </value>' +
  '</block>';

Blockly.Blocks['gsmsms'] = {
  init: function() {
    var options = [
      [Blockly.Translate('gsmsms_anyInstance'), '']
    ];
    if (typeof main !== 'undefined' && main.instances) {
      for (var i = 0; i < main.instances.length; i++) {
        var m = main.instances[i].match(/^system.adapter.gsmsms.(\d+)$/);
        if (m) {
          var k = parseInt(m[1], 10);
          options.push(['gsmsms.' + k, '.' + k]);
        }
      }
      if (options.length === 0) {
        for (var u = 0; u <= 4; u++) {
          options.push(['gsmsms.' + u, '.' + u]);
        }
      }
    } else {
      for (var n = 0; n <= 4; n++) {
        options.push(['gsmsms.' + n, '.' + n]);
      }
    }

    this.appendDummyInput('INSTANCE')
      .appendField(Blockly.Translate('gsmsms'))
      .appendField(new Blockly.FieldDropdown(options), 'INSTANCE');

    this.appendValueInput('MESSAGE')
      .appendField(Blockly.Translate('gsmsms_message'));

    var input = this.appendValueInput('RECIPIENT')
      .setCheck('String')
      .appendField(Blockly.Translate('gsmsms_recipient'));

    this.appendDummyInput("ALERT")
      .appendField(Blockly.Translate('gsmsms_alert'))
      .appendField(new Blockly.FieldCheckbox('FALSE'), 'ALERT');

    if (input.connection) {
      input.connection._optional = true;
    }

    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);

    this.setColour(Blockly.Sendto.HUE);
    this.setTooltip(Blockly.Translate('gsmsms_tooltip'));
    this.setHelpUrl(Blockly.Translate('gsmsms_help'));
  }
};

Blockly.JavaScript['gsmsms'] = function(block) {
    var dropdown_instance = block.getFieldValue('INSTANCE');
    var value_message = Blockly.JavaScript.valueToCode(block, 'MESSAGE', Blockly.JavaScript.ORDER_ATOMIC);
    var value_number = Blockly.JavaScript.valueToCode(block, 'RECIPIENT', Blockly.JavaScript.ORDER_ATOMIC);
    var value_alert = block.getFieldValue('ALERT');

    return 'sendTo("gsmsms' + dropdown_instance + '", "send", {text:' +
      value_message + ',recipient: ' + value_number + ', alert: ' + value_alert) +
  '});\n';
};
