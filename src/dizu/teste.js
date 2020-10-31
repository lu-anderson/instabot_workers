jQuery(".dropdown-toggle").dropdown();
jQuery(function () {
  jQuery(".sidebar a, .cbp-spmenu a")
    .filter(function () {
      return this.href == location.href;
    })
    .parent()
    .addClass("text_blue")
    .siblings()
    .removeClass("text_blue");
  jQuery(".sidebar a, .cbp-spmenu a").click(function () {
    jQuery(this)
      .parent()
      .addClass("text_blue")
      .siblings()
      .removeClass("text_blue");
  });
  jQuery(".datePicker").datepicker();
});
new Swiper(".swiper-container", {
  pagination: { el: ".swiper-pagination", dynamicBullets: true },
  autoplay: { delay: 5000 },
});
new Swiper(".depoimento", {
  pagination: { el: ".swiper-pagination depoimento", dynamicBullets: true },
  autoplay: { delay: 5000 },
});
let menuLeft = document.getElementById("cbp-spmenu-s1"),
  showLeftPush = document.getElementById("showLeftPush"),
  menu_mob = document.getElementById("menu_mob"),
  body = document.body;
showLeftPush.onclick = function () {
  classie.toggle(this, "active");
  classie.toggle(menu_mob, "active");
  classie.toggle(menu_mob, "sombra");
  classie.toggle(menu_mob, "close_menu");
  classie.toggle(body, "cbp-spmenu-push-toright");
  classie.toggle(menuLeft, "cbp-spmenu-open");
  disableOther("showLeftPush");
};
function disableOther(button) {
  if (button !== "showLeftPush") {
    classie.toggle(showLeftPush, "disabled");
  }
}
(function () {
  "use strict";
  window.addEventListener(
    "load",
    function () {
      var forms = document.getElementsByClassName("needs-validation");
      var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add("was-validated");
          },
          false
        );
      });
    },
    false
  );
})();
let loadHighLight = (i) => {
  i(function () {
    i(".highlight, div.highlight").each(function () {
      var t =
        '<div class="bd-clipboard input-group-prepend"><button type="button" class="input-group-text btn-clipboard noBorder noBg" title="Copiar"><i class="dizu-copy"></i></button></div>';
      i(this).before(t);
      i(".btn-clipboard").on("mouseleave", function () {
        i(this).tooltip("close");
      });
    });
    var t = new ClipboardJS(".btn-clipboard", {
      target: function (t) {
        return t.parentNode.nextElementSibling;
      },
    });
    t.on("success", function (t) {
      i(t.trigger)
        .addClass("text_blue")
        .attr("title", "Copiado!")
        .attr("title", "Copiar");
      t.clearSelection();
    });
    t.on("error", function (t) {
      var e = /Mac/i.test(navigator.userAgent) ? "⌘" : "Ctrl-";
      var n = "Aperte " + e + "C para copiar";
      i(t.trigger).attr("title", n).attr("title", "Copiar");
    });
  });
};
(function (i) {
  "use strict";
  loadHighLight(i);
})(jQuery);
(function (i) {
  jQuery("#cpfContaBancaria").mask("000.000.000-00", { reverse: true });
})(jQuery);
let form = async (url, data) => {
  return new Promise(function (resolve, reject) {
    grecaptcha
      .execute("6LfgxNkUAAAAAJ9XoWgyI92_oLnt0vPVtmuCKqoO", {})
      .then(function (token) {
        data.push({ name: "recaptcha_token", value: token });
        jQuery.ajax(
          {
            type: "POST",
            url: url,
            data: data,
            success: function (data) {
              console.log(data);
              resolve(data);
            },
            error: function (data) {
              resolve(JSON.parse(data.responseText));
            },
          },
          "json"
        );
      });
  });
};
let estado = "";
let setaEstado = () => {
  jQuery.getJSON("https://ipapi.co/json/", function (data) {
    if (data.region_code) {
      estado = data.region_code;
    }
  });
};
let carregaTarefas = async (numero) => {
  let contaInstagram = jQuery("#instagram_id");
  let contaTwitter = jQuery("#twitter_id");
  let contaTikTok = jQuery("#tiktok_id");
  let tarefas10 = jQuery("#tarefas10:checked").length;
  let curtida05 = jQuery("#curtida05:checked").length;
  if (
    !parseInt(contaInstagram.val().toString()) &&
    !parseInt(contaTwitter.val().toString()) &&
    !parseInt(contaTikTok.val().toString())
  ) {
    return false;
  }
  jQuery(".box_user.tarefa").remove();
  jQuery(".loaderDiv").show();
  contaInstagram.attr("disabled", "disabled");
  contaTwitter.attr("disabled", "disabled");
  contaTikTok.attr("disabled", "disabled");
  let qs = "/painel/listar_pedido/?";
  qs += "&conta_id=" + contaInstagram.val();
  qs += "&twitter_id=" + contaTwitter.val();
  qs += "&tiktok_id=" + contaTikTok.val();
  qs += "&tarefa10=" + tarefas10;
  qs += "&curtida05=" + curtida05;
  if (estado != "") {
    qs += "&estado=" + estado;
  }
  jQuery.get(qs, (data) => {
    if (data === "" && !jQuery(".tarefa").length) {
      jQuery(".semTarefas").removeClass("hide");
    } else {
      jQuery(".semTarefas").addClass("hide");
    }
    jQuery(".tarefasLista").append(data);
    jQuery("#twitter_id").removeAttr("disabled");
    jQuery("#instagram_id").removeAttr("disabled");
    jQuery("#tiktok_id").removeAttr("disabled");
    jQuery(".loaderDiv").hide();
    jQuery(".dicas:not(.hidden)").addClass("hidden");
    var len = $(".dicas").length;
    var random = Math.floor(Math.random() * len) + 1;
    $(".dicas").eq(random).removeClass("hidden");
  });
};
let estadosCidadesData;
let loadDefaultcity = () => {
  jQuery.getJSON("https://ipapi.co/json/", function (data) {
    if (data.region_code) {
      jQuery("#validationState").val(data.region_code);
      jQuery("#validationState").trigger("change");
      setTimeout(function () {
        jQuery("#validationCity").val(data.city);
      }, 500);
    }
  });
};
let loadCities = () => {
  jQuery.getJSON("/painel/assets/estados-cidades.json", function (data) {
    estadosCidadesData = data;
    let option;
    for (let estado of data.estados) {
      option = jQuery("<option />").val(estado.sigla).text(estado.nome);
      jQuery("#validationState").append(option);
    }
    loadDefaultcity();
  });
};
jQuery(document).on("click", "#instagram_id", function (e) {
  let isFake = jQuery("#instagram_id option:selected").attr("data-fake");
  if (isFake == "0") {
    jQuery(".tarefas10").removeClass("hidden");
  } else {
    jQuery(".tarefas10").addClass("hidden");
  }
  let faz10 = jQuery("#instagram_id option:selected").attr("data-faz10");
  if (faz10 == "1") {
    jQuery("#tarefas10").attr("checked", "checked");
  } else {
    jQuery("#tarefas10").removeAttr("checked");
  }
});
jQuery("#validationState").on("change", function (e) {
  jQuery("#validationCity").html("");
  let val = jQuery(this).val();
  let option;
  for (let estado of estadosCidadesData.estados) {
    if (estado.sigla === val) {
      for (let cidade of estado.cidades) {
        option = jQuery("<option />")
          .val(cidade.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
          .text(cidade);
        jQuery("#validationCity").append(option);
      }
    }
  }
});
jQuery(document).on("click", "#conectar_step_4", (e) => {
  jQuery("#conectar_step_5").removeClass("d-none");
});
jQuery(document).on("click", "#conectar_step_5", (e) => {
  jQuery(".box_user").hide();
  jQuery(".loaderDiv").show();
  jQuery(".formSuccess, .formError, .invalid-feedback").hide();
});
jQuery(document).on("submit", ".forms", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  let formElement = jQuery(e.currentTarget);
  formElement.find(".formSuccess, .formError, .invalid-feedback").hide();
  let loader = formElement.find(".loaderDiv");
  loader.show();
  let submitButton = formElement.find("button[type='submit']");
  submitButton.attr("disabled", "disabled");
  let url = formElement.attr("action");
  let data = formElement.serializeArray();
  let response = await form(url, data);
  if (response.hasOwnProperty("id_ticket")) {
    window.location.href = "/painel/suporte/" + response.id_ticket;
  } else if (response.hasOwnProperty("reload")) {
    window.location.reload();
  } else if (response.hasOwnProperty("pedido_success")) {
    jQuery(".formSuccess.tarefaSuccess").show();
    carregaTarefas(1);
  } else if (response.hasOwnProperty("pedido_error")) {
    jQuery(".formError").show();
    jQuery(".formError .errorMsg").text(response.pedido_error);
    carregaTarefas(1);
  } else if (response.hasOwnProperty("pkid")) {
    jQuery(".conecta").addClass("hide");
    jQuery(".conecta.part3").removeClass("hide");
  } else if (response.hasOwnProperty("codVerificacao")) {
    jQuery(".conecta").addClass("hide");
    jQuery(".conecta.part2").removeClass("hide");
    jQuery("#proveQueEhvoceTxt").text(
      "Dizu: meu código de confirmação é " + response.codVerificacao
    );
    let text = jQuery("#validationDefaultUsername").val().toString();
    jQuery("#perfilConfirmar").val(text);
    jQuery(".perfilSendoAdd").text(text);
    jQuery(".LinkPerfilSendoAdd").attr(
      "href",
      "https://instagram.com/" + text.replace("@", "")
    );
  } else if (response.success) {
    formElement.find(".formSuccess").show();
  } else {
    formElement.find(".formError").show();
    let div, divError;
    for (let erro of response.errors) {
      div = jQuery(formElement).find("[name='" + erro.param + "']");
      if (div == null) {
        continue;
      }
      divError = div
        .closest("div.input-group, div.form-group")
        .find(".invalid-feedback");
      if (divError == null) {
        continue;
      }
      divError.show();
      divError.text(erro.msg);
    }
  }
  loader.hide();
  submitButton.removeAttr("disabled");
  return false;
});
jQuery(document).on("click", ".remove_account", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  if (!confirm("Deseja remover resta conta?")) {
    return false;
  }
  let conta_id = jQuery(e.currentTarget).data("id");
  let data = [];
  data.push({ name: "conta_id", value: conta_id });
  let response = await form("/painel/remove_conta", data);
  if (response.success) {
    window.location.reload();
  } else {
    for (let erro of response.errors) {
      alert(erro.msg);
    }
  }
});
jQuery(document).on("click", ".remove_profile", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  if (!confirm("Deseja remover este perfil?")) {
    return false;
  }
  let conta_id = jQuery(e.currentTarget).data("id");
  let data = [];
  data.push({ name: "conta_id", value: conta_id });
  let response = await form("/painel/remove_perfil", data);
  if (response.success) {
    window.location.reload();
  } else {
    for (let erro of response.errors) {
      alert(erro.msg);
    }
  }
});
jQuery(document).on("click", "#iniciarTarefas", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  carregaTarefas(1);
});
jQuery(document).on("click", ".pularTarefa", (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  if (
    !confirm(
      "Você quer mesmo pular esta tarefa? Caso pule, não poderá realizar novamente."
    )
  ) {
    return false;
  }
  let div = jQuery(e.currentTarget).closest(".tarefa");
  let tarefa_id = div.data("tarefa_id");
  grecaptcha
    .execute("6LfgxNkUAAAAAJ9XoWgyI92_oLnt0vPVtmuCKqoO", {})
    .then(function (token) {
      jQuery
        .post("/painel/confirmar_pedido", {
          recaptcha_token: token,
          realizado: 3,
          tarefa_id: tarefa_id,
          conta_id: jQuery("#conta_id_acao").val(),
        })
        .then(function () {
          div.remove();
          carregaTarefas(1);
        });
    });
});
jQuery(document).on("click", "#pularTarefaPrivada", (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  let div = jQuery(e.currentTarget).closest(".tarefa");
  let tarefa_id = div.data("tarefa_id");
  grecaptcha
    .execute("6LfgxNkUAAAAAJ9XoWgyI92_oLnt0vPVtmuCKqoO", {})
    .then(function (token) {
      jQuery
        .post("/painel/confirmar_pedido", {
          recaptcha_token: token,
          realizado: 3,
          privado: true,
          tarefa_id: tarefa_id,
          conta_id: jQuery("#conta_id_acao").val(),
        })
        .then(function () {
          div.remove();
          carregaTarefas(1);
        });
    });
});
jQuery(document).on("change", "#bancoNome", (e) => {
  let val = jQuery("#bancoNome").val();
  if (val >= 996) {
    jQuery("#cadastrar_conta_form .bancos").addClass("d-none");
    jQuery("#cadastrar_conta_form .outros").removeClass("d-none");
    jQuery(
      "#agenciaBancaria, #contaBancaria, #tipoConta, #nomeContaBancaria, #cpfContaBancaria"
    ).val(0);
  } else {
    jQuery("#cadastrar_conta_form .bancos").removeClass("d-none");
    jQuery("#cadastrar_conta_form .outros").addClass("d-none");
    jQuery(
      "#agenciaBancaria, #contaBancaria, #tipoConta, #nomeContaBancaria, #cpfContaBancaria"
    ).val("");
  }
});
jQuery(document).on(
  "change blur",
  ".formcalc input, .formcalc select",
  async (e) => {
    let formElement = jQuery(e.currentTarget).closest(".formcalc");
    formElement.find(".formSuccess, .formError, .invalid-feedback").hide();
    let url = formElement.attr("action");
    let data = formElement.serializeArray();
    data.push({ name: "calculo", value: "1" });
    let response = await form(url, data);
    if (response.hasOwnProperty("pontos")) {
      let valor_txt = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(response.pontos * 0.01);
      formElement.find(".valor_total").text(valor_txt);
    } else {
      let div, divError;
      for (let erro of response.errors) {
        div = jQuery(formElement).find("[name='" + erro.param + "']");
        if (div == null) {
          continue;
        }
        divError = div
          .closest("div.input-group, div.form-group")
          .find(".invalid-feedback");
        if (divError == null) {
          continue;
        }
        divError.show();
        divError.text(erro.msg);
      }
    }
  }
);
let notificacoesLidas = () => {
  jQuery("#formNotificacoes").trigger("submit");
};
