/**
 *
 * @param {Array} interface 接口集合
 * @param {Number} wordApi 如果是单词使用接口下标
 * 接口格式
 * {
 *    name(String):'接口名',
 *    api(String):'接口请求地址',
 *    data(function):返回接口请求数据,
 *    parse(function):请求响应后会调用该函数并传入接口返回的参数json,解析完返回html字符串
 *    next(Number):指向切换时下一个接口下标
 * }
 */
function Translate(interface, wordApi) {
  this.api = {
    current: 0,
    wordApi: wordApi || 0, //单词api
    previsWord: false,
    interface: interface,
    getNext: function() {
      this.current = this.getCurrent().next==undefined?this.current:this.getCurrent().next;
      return this.interface[this.current];
    },
    getCurrent: function() {
      if(this.previsWord){
        return this.interface[this.wordApi];
      }
      return this.interface[this.current];
    },
    getData: function(text) {
      return this.getCurrent().data(text);
    },
    parse: function(resData, e) {
      var mouse = Translate.getMousePos(e);
      document.translate = layer.open({
        title: "翻译结果",
        id: "translate",
        content: this.getCurrent().parse(resData),
        btn: false,
        closeBtn: 0,
        shade: 0,
        offset: [mouse.y + "px", mouse.x + "px"],
        area: "auto",
        success: function(layero, index) {
          var top = layero.position().top - layero.height();
          var left = layero.position().left;
          var maxTop = Translate.getDocPos().h - layero.height();
          var maxLeft = Translate.getDocPos().w - layero.width();
          if (top < 10) {
            top = "10px";
          } else if (top > maxTop) {
            top = maxTop + "px";
          }
          layero.css({
            top: top,
            left: left > maxLeft ? maxLeft : left
          });
          layero.one("mouseenter", function() {
            layer.tips(
              "双击T键即可切换翻译引擎",
              layero,
              {
                tips: [1, "#3CB371"],
                time: 3000
              }
            );
          });
          document.translateLock = false;
        },
        end: function() {
          document.translate = false;
        }
      });
    }
  };

  Translate.voiceIcon='<i onmouseenter="pronunciation(this,1)" onmouseleave="pronunciation(this,0)"style="cursor:pointer;margin:0 4px"><svg t="1568447985330" class="icon" style="width: 2em;height: 2em;vertical-align:bottom;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2245" width="48" height="48"><path d="M308.971 657.987l150.28 165.279a16 16 0 0 0 11.838 5.236c8.837 0 16-7.163 16-16v-600.67a16 16 0 0 0-5.236-11.839c-6.538-5.944-16.657-5.463-22.602 1.075l-150.28 165.279A112 112 0 0 1 226.105 403H177c-17.673 0-32 14.327-32 32v154.333c0 17.674 14.327 32 32 32h49.105a112 112 0 0 1 82.866 36.654zM177 701.333c-61.856 0-112-50.144-112-112V435c0-61.856 50.144-112 112-112h49.105a32 32 0 0 0 23.676-10.472l150.28-165.28c35.668-39.227 96.383-42.113 135.61-6.445a96 96 0 0 1 31.418 71.028v600.671c0 53.02-42.98 96-96 96a96 96 0 0 1-71.029-31.417l-150.28-165.28a32 32 0 0 0-23.675-10.472H177z m456.058-348.336c-18.47-12.118-23.621-36.915-11.503-55.386 12.118-18.471 36.916-23.621 55.387-11.503C752.495 335.675 799 419.908 799 512c0 92.093-46.505 176.325-122.058 225.892-18.471 12.118-43.269 6.968-55.387-11.503-12.118-18.471-6.968-43.268 11.503-55.386C686.303 636.07 719 576.848 719 512c0-64.848-32.697-124.07-85.942-159.003z m92.93-137.323c-18.07-12.71-22.415-37.66-9.706-55.73s37.66-22.415 55.73-9.706C888.942 232.478 960 366.298 960 512s-71.058 279.522-187.988 361.762c-18.07 12.71-43.021 8.364-55.73-9.706-12.709-18.07-8.363-43.02 9.706-55.73C821.838 740.912 880 631.38 880 512c0-119.38-58.161-228.912-154.012-296.326z" p-id="2246"></path></svg></i>';

  /**
   *
   * @param {object} event 事件对象
   * @returns
   */
  Translate.getMousePos = function(event) {
    var e = event || window.event;
    return {
      x: e.clientX,
      y: e.clientY
    };
  };

  // 获取选中的文本
  Translate.getSelectText = function() {
    var selection = window.getSelection || document.getSelection;
    return selection() + "";
  };

  //清除选中的文本
  Translate.clearSlct =
    "getSelection" in window
      ? function() {
          window.getSelection().removeAllRanges();
        }
      : function() {
          document.selection.empty();
        };

  //获取可视区宽高
  Translate.getDocPos = function() {
    return {
      w: $(document).width(),
      h: $(document).height()
    };
  };

  /**
   *
   * 获取元素定位最大的top值和left值
   * @param {Number} width  元素宽度
   * @param {Number} height 元素高度
   * @returns Object
   */
  Translate.maxPos = function(width, height) {
    return {
      maxLeft: Translate.getDocPos().h - height,
      maxTop: Translate.getDocPos().w - width
    };
  };

  /**
   *
   *判断文本是否是全中文
   * @param {String} str
   * @returns
   */
  Translate.isChina = function(str) {
    var reg = /^([\u4E00-\u9FA5]|[\uFF00-\uFF20]|[\u3000-\u301C])+$/;
    return !!reg.test(str);
  };

  /**
   *
   *有道翻译生成签名中的input
   * @param {String} q 代翻译文本
   * @returns
   */
  Translate.truncate = function(q) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
  };

  /**
   *
   *判断转换语言
   * @param {String} text 代翻译文本
   * @returns from 中文/英文 to 中文/英文
   */
  Translate.getTransfer = function(text) {
    var from = Translate.isChina(text) ? "zh" : "en";
    var to = from == "zh" ? "en" : "zh";
    return {
      from: from,
      to: to
    };
  };

  /**
   *单词发音
   * @param {Object/String} obj 触发发音的DOM 传this即可
   * @param {Number} flag 1：鼠标进入 0：鼠标移出
   * @returns
   */
  window.pronunciation = function(obj, flag) {
    if (!flag) {
      $(obj)
        .find("path")
        .removeAttr("fill");
      return;
    }
    $(obj)
      .find("path")
      .attr("fill", "#FFA500");
    $("#pronunciation").remove();
    var link = $(obj)
      .prev("span")
      .attr("data-link");
    $(
      '<audio id="pronunciation" src="' +
        link +
        '" autoplay="autoplay" style="display: none">'
    ).appendTo("body");
  };

  /**
   *获取文本单词数 全中文返回1
   * @param {String} str
   * @returns
   */
  Translate.countOfWord = function(str) {
    var value = String(str);

    value = value.replace(/^\s+|\s+$/gi, ""); // 前后空格不计算为单词数

    value = value.replace(/\s+/gi, " "); // 多个空格替换成一个空格

    var length = 0; // 更新计数
    var match = value.match(/\s/g); //没有匹配到则返回null
    if (match) {
      length = match.length + 1;
    } else if (value) {
      length = 1;
    }
    return length;
  };

  (function() {
    var api = this.api;
    //注册事件
    $(document).mousedown(function(e) {
      Translate.clearSlct();
    });
    var db = 0;
    $(document).keydown(function(e) {
      if (document.translateLock) {
        return;
      }
      var nt = new Date().getTime();
      var ct = nt - db;
      if ((e.keyCode === 84) & (ct > 0) && ct < 500) {
        layer.msg("切换成功，当前接口：" + api.getNext().name, {
          time: 1000
        });
      }
      db = nt;
    });
    $(document).click(function(e) {
      text = $.trim(Translate.getSelectText());
      if (document.translate) {
        layer.close(document.translate);
      }
      if (text.length > 1) {
        $(".syl-translate").remove();
        $(
          '<div style="top:' +
            (Translate.getMousePos().y + 10) +
            "px;left:" +
            //事件执行顺序mousedown>mouseup>click
            (Translate.getMousePos().x + 10) +
            'px;" class="syl-translate" unselectable="on">译</div>'
        )
          .mouseup(function(e) {
            $(this).remove();
            var e = e || window.event;
            var index = layer.load(2);
            document.translateLock = true;
            var useApi;
            if (Translate.countOfWord(text) == 1 && !Translate.isChina(text)) {
              api.previsWord = true;
            } else {
              api.previsWord = false;
            }
            $.post(
              api.getCurrent().api,
              api.getData(text),
              function(resData) {
                layer.close(index);
                api.parse(resData, e);
              },
              "jsonp"
            );
          })
          .appendTo("body");
      } else {
        $(".syl-translate").remove();
      }
    });
  }.apply(this));
}