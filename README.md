# translate
划词翻译
## 示例  
	var interface = [
      {
        name: "百度",
        api: "https://fanyi-api.baidu.com/api/trans/vip/translate",
        data: function(text) {
          var appid = "1568506049000";
          var key = "314704f49fbf536cb146edebf5aff76f";
          var salt = new Date().getTime();
          var query = text;
          var transfer = Translate.getTransfer(text);
          var str1 = appid + query + salt + key;
          var sign = md5(str1);
          return {
            q: query,
            from: transfer.from,
            to: transfer.to,
            appid: appid,
            salt: salt,
            sign: sign
          };
        },
        parse: function(resData) {
          console.log(t.api);
          if (resData.trans_result) {
            var result = resData.trans_result[0].dst;
            return (
              result +
              '<span style="position: absolute;bottom: 2px;right: 2px;font-size:0.5rem;color: #888888;">SYL的笔记.' +
              this.name +
              "</span>"
            );
          }
        },
		....
	];

	var t = new Translate(interface);
