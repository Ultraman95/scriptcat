// ==UserScript==
// @name         测试面板通信
// @namespace    http://scriptcat.org/
// @version      1.0
// @description  测试脚本和Sidepanel测试面板之间的双向通信
// @author       test
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function () {
    'use strict';

    console.log('[测试面板通信] 脚本已加载');

    // 发送数据到面板 - 在面板中点击"读取值"即可看到
    GM_setValue("panel_message", {
        msg: "Hello from script!",
        url: window.location.href,
        time: new Date().toLocaleString(),
        title: document.title
    });
    console.log('[测试面板通信] 已发送 panel_message 到面板');

    // 监听来自面板的消息
    GM_addValueChangeListener("panel_response", (name, oldValue, newValue, remote) => {
        if (remote) {
            console.log('[测试面板通信] 收到面板消息:', newValue);
            alert('收到面板消息:\n' + JSON.stringify(newValue, null, 2));
        }
    });
    console.log('[测试面板通信] 已开始监听 panel_response');

    // 在页面上添加一个发送按钮方便测试
    const btn = document.createElement('button');
    btn.textContent = '发送测试消息到面板';
    btn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:999999;padding:10px 15px;background:#1890ff;color:white;border:none;border-radius:4px;cursor:pointer;font-size:14px;';
    btn.onclick = () => {
        const msg = {
            action: "button_click",
            time: new Date().toLocaleString(),
            random: Math.random().toString(36).substring(7)
        };
        GM_setValue("panel_message", msg);
        console.log('[测试面板通信] 手动发送消息:', msg);
        alert('已发送消息到面板!\n请在面板中点击"读取值"查看');
    };
    document.body.appendChild(btn);

})();
