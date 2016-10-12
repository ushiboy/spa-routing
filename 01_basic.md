# フロントエンドルーティングの仕組み

## 背景

「Ajaxで取得したデータを使って、画面の一部を動的に描画する」から「動的に複数画面を切り替えて描画する」へ。

## 効能

複数画面を動的にフロントエンドで切り替えるときに、ルーティングあるなしで次のような違いが出てくる。

### ルーティングがない場合

* ブラウザの戻る、進むが使えない。
* ブラウザでリロードすると最初の画面に戻ってしまう。
* ユーザーにとって操作性悪い。
* 開発効率悪い。

### ルーティングがある場合

* ブラウザの戻る、進むが使える。
* ブラウザでリロードすると開いていた画面を表示できる。
* ユーザーにとって操作性が通常のWebページのようになる（加えて、一からすべてHTTP投げ直して再描画ではなくなる）。
* 開発効率良い。


## 仕組み

Hashを使う方法とHistory APIを使う方法の2通り。

### Hashを用いた実装

#### 原理

URLのHash（正式にはフラグメント識別子らしい）
```
http://localhost:8080/index.html#hoge
```
を利用した方法。（上の例の**#hoge**部分）


次のようなaタグをクリックした場合にURLのHash部分が書き換わる。
```html
<a href="#hoge">Hoge</a>
```

JavaScriptからは次のように設定、取得できる。
```javascript
location.hash = 'hoge';

console.log(location.hash); // -> '#hoge'
```

これらによってHashに変更が起こる場合に発生する、hashchangeイベントを利用してルーティングを行う。

#### 動作確認コード

```javascript
window.addEventListener('hashchange', e => {
  const { newURL, oldURL } = e;
  console.log(newURL);
  console.log(oldURL);
}, false);
```

#### 補足

hashchangeイベントはHashが変わらない場合は発生しない。
(location.hash === '#aaa'のときにlocation.hash ='aaa'してもおこらない）

リロードした時には発生しない。history.go, history.backではHashが変更されれば起こる。

Hashより前のURLの要素を変えることはできない。

ブラウザはHashをサーバへ送らないので、Hashによるフロントエンドルーティングではサーバサイドレンダリングを行うことができない。

#### 参考

* [MDN aタグ](https://developer.mozilla.org/ja/docs/Web/HTML/Element/a)
* [MDN onhashchange](https://developer.mozilla.org/ja/docs/Web/API/WindowEventHandlers/onhashchange)
* [Wikipedia Fragment Identifier](https://en.wikipedia.org/wiki/Fragment_identifier)
* [Googleが過去にやってたescaped_fragmentの話](https://developers.google.com/webmasters/ajax-crawling/docs/getting-started)



### History APIを用いた実装

#### 原理

History APIを利用したルーティング

JavaScriptで次のようにpushStateまたはreplaceStateを使ってサーバにリクエストを投げることなく、履歴を変更する。
```javascript
history.pushState(state, title, '/hoge');

history.replaceState(state, title, '/hoge');
```

次のようなaタグをクリックした場合には、クリックのデフォルト挙動をキャンセルしてハンドリングする。
```html
<a href="/hoge">Hoge</a>
```

#### 動作確認コード

```javascript
function handleClick(e) {
  e.preventDefault();
  const { href } = e.target;
  history.pushState(href, null, href);
}

const links = document.querySelectorAll('a');

Array.from(links).forEach(link => {
  link.addEventListener('click', handleClick, false);
});

window.addEventListener('popstate', e => {
  const { state } = e;
  console.log(state);
}, false);
```

#### 補足


書き換え時にイベントは発生しない。
history.go, history.backを使った時にpopstateイベントが発生する。

同じoriginのパスならどこでも書き換えられる。

サーバ側でrewriteするなどが必要。
サーバサイドレンダリングと組み合わせることができる。

#### 参考

* [MDN onpopstate](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate)
* [MDN 履歴操作](https://developer.mozilla.org/ja/docs/Web/Guide/DOM/Manipulating_the_browser_history)

### 比較

| | Hash | History |
| --- | --- | --- |
| 難易度| 手軽 | aタグのデフォルト挙動対策が必要 |
| サーバサイドの設定 | 考慮なし | rewrite考慮必要 |
| サーバサイドレンダリング | できない | できる |
| 用途 | 裏画面、Electronアプリ | 表画面 |

## ルートの定義

サーバサイドのルーティングのような感じに。

```
#/todos
#/todos/1    -> #/todos/:id
/todos
/todos/1     -> /todos/:id
```

## お題

HashまたはHistory APIを利用して次のようなサンプルアプリを書いてみる。(Hashの場合はhrefの頭に#を追加)

* ルート/todosで次の画面を表示する。
```html
<div>
  <h1>List</h1>
  <ul>
    <li><a href="/todos/1">Item 1</a></li>
  </ul>
</div>
```
* ルート/todos/1で次の画面を表示する。
```html
<div>
  <h1>Item 1</h1>
  <a href="/todos">Back</a>
</div>
```

[参考 path-to-regexp](https://www.npmjs.com/package/path-to-regexp)
