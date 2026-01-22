import Logger from "@App/pages/options/routes/Logger";
import ScriptEditor from "@App/pages/options/routes/script/ScriptEditor";
import ScriptList from "@App/pages/options/routes/ScriptList";
import Setting from "@App/pages/options/routes/Setting";
import SubscribeList from "@App/pages/options/routes/SubscribeList";
import Tools from "@App/pages/options/routes/Tools";
import { Layout, Menu, Select, Button, Input, Card, Space, Message } from "@arco-design/web-react";
import {
  IconCode,
  IconFile,
  IconGithub,
  IconLeft,
  IconLink,
  IconQuestion,
  IconRight,
  IconSettings,
  IconSubscribe,
  IconTool,
  IconMessage,
  IconRobot,
} from "@arco-design/web-react/icon";
import React, { useEffect, useRef, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RiFileCodeLine, RiGuideLine, RiLinkM } from "react-icons/ri";
import SiderGuide from "./SiderGuide";
import CustomLink from "../CustomLink";
import { localePath } from "@App/locales/locales";
import { DocumentationSite } from "@App/app/const";
import { message as extMessage } from "@App/pages/store/global";
import { ValueClient, ScriptClient } from "@App/app/service/service_worker/client";
import type { Script } from "@App/app/repo/scripts";

// 简单的测试对话框组件，用于测试脚本和sidepanel之间的通信
const TestChat: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [sendKey, setSendKey] = useState("panel_response");
  const [sendValue, setSendValue] = useState("");

  const valueClient = new ValueClient(extMessage);
  const scriptClient = new ScriptClient(extMessage);

  // 加载脚本列表
  useEffect(() => {
    scriptClient.getAllScripts().then((list) => {
      setScripts(list.filter((s) => s.status === 1));
    });
  }, []);

  // 读取脚本存储值
  const loadValues = async () => {
    const script = scripts.find((s) => s.uuid === selectedUuid);
    if (!script) return;
    try {
      const v = await valueClient.getScriptValue(script);
      setValues(v);
      Message.success("加载成功");
    } catch (e) {
      Message.error("加载失败: " + e);
    }
  };

  // 发送值给脚本
  const sendToScript = async () => {
    if (!selectedUuid || !sendKey) {
      Message.warning("请选择脚本并输入Key");
      return;
    }
    try {
      let parsed: unknown = sendValue;
      try { parsed = JSON.parse(sendValue); } catch { /* keep string */ }
      await valueClient.setScriptValue(selectedUuid, sendKey, parsed);
      Message.success("发送成功");
      loadValues();
    } catch (e) {
      Message.error("发送失败: " + e);
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <Card title="测试面板 - 脚本通信测试" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space>
            <span>选择脚本:</span>
            <Select
              style={{ width: 250 }}
              placeholder="选择一个脚本"
              onChange={(v) => { setSelectedUuid(v); setValues({}); }}
              showSearch
            >
              {scripts.map((s) => (
                <Select.Option key={s.uuid} value={s.uuid}>{s.name}</Select.Option>
              ))}
            </Select>
            <Button type="primary" onClick={loadValues} disabled={!selectedUuid}>
              读取值
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="脚本存储值 (GM_getValue)" style={{ marginBottom: 16 }}>
        <pre style={{
          maxHeight: 200,
          overflow: "auto",
          background: "var(--color-fill-2)",
          padding: 8,
          borderRadius: 4,
          fontSize: 12
        }}>
          {Object.keys(values).length === 0
            ? `暂无数据，请选择脚本并点击"读取值"`
            : JSON.stringify(values, null, 2)}
        </pre>
      </Card>

      <Card title="发送值给脚本 (脚本通过 GM_addValueChangeListener 接收)">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space>
            <span>Key:</span>
            <Input
              style={{ width: 200 }}
              value={sendKey}
              onChange={setSendKey}
              placeholder="panel_response"
            />
          </Space>
          <Space>
            <span>Value:</span>
            <Input.TextArea
              style={{ width: 300 }}
              value={sendValue}
              onChange={setSendValue}
              placeholder='输入值，支持JSON如 {"msg":"hello"}'
              autoSize={{ minRows: 2 }}
            />
          </Space>
          <Button type="primary" onClick={sendToScript} disabled={!selectedUuid}>
            发送给脚本
          </Button>
        </Space>
      </Card>

      <Card title="使用说明" style={{ marginTop: 16 }}>
        <p><b>脚本发送数据到面板:</b></p>
        <pre style={{ background: "var(--color-fill-2)", padding: 8, borderRadius: 4, fontSize: 12 }}>
          {`GM_setValue("panel_message", { msg: "hello" });`}
        </pre>
        <p style={{ marginTop: 8 }}><b>脚本接收面板发送的数据:</b></p>
        <pre style={{ background: "var(--color-fill-2)", padding: 8, borderRadius: 4, fontSize: 12 }}>
          {`GM_addValueChangeListener("panel_response", (name, old, val, remote) => {
  if (remote) console.log("收到:", val);
});`}
        </pre>
      </Card>
    </div>
  );
};

const MenuItem = Menu.Item;
let { hash } = window.location;
if (!hash.length) {
  hash = "/";
} else {
  hash = hash.substring(1);
}

const Sider: React.FC = () => {
  const [menuSelect, setMenuSelect] = useState(hash);
  const [collapsed, setCollapsed] = useState(localStorage.collapsed === "true");
  const { t } = useTranslation();
  const guideRef = useRef<{ open: () => void }>(null);

  const { handleMenuClick } = {
    handleMenuClick: (key: string) => {
      setMenuSelect(key);
    },
  };

  return (
    <HashRouter>
      <SiderGuide ref={guideRef} />
      <Layout.Sider className="h-full" collapsed={collapsed} width={170}>
        <div className="flex flex-col justify-between h-full">
          <Menu style={{ width: "100%" }} selectedKeys={[menuSelect]} selectable onClickMenuItem={handleMenuClick}>
            <CustomLink to="/chat">
              <MenuItem key="/chat">
                <IconMessage /> {"Chat"}
              </MenuItem>
            </CustomLink>
            <CustomLink to="/">
              <MenuItem key="/" className="menu-script">
                <IconCode /> {"脚本管理"}
              </MenuItem>
            </CustomLink>
            <CustomLink to="/models">
              <MenuItem key="/models">
                <IconRobot /> {"模型管理"}
              </MenuItem>
            </CustomLink>
            {/* <CustomLink to="/subscribe">
              <MenuItem key="/subscribe">
                <IconSubscribe /> {t("subscribe")}
              </MenuItem>
            </CustomLink>
            <CustomLink to="/logger">
              <MenuItem key="/logger">
                <IconFile /> {t("logs")}
              </MenuItem>
            </CustomLink> */}
            <CustomLink to="/tools" className="menu-tools">
              <MenuItem key="/tools">
                <IconTool /> {t("tools")}
              </MenuItem>
            </CustomLink>
            <CustomLink to="/setting" className="menu-setting">
              <MenuItem key="/setting">
                <IconSettings /> {t("settings")}
              </MenuItem>
            </CustomLink>
          </Menu>
          <Menu
            style={{ width: "100%", borderTop: "1px solid var(--color-bg-5)" }}
            selectedKeys={[]}
            selectable
            onClickMenuItem={handleMenuClick}
            mode="pop"
          >
            <Menu.SubMenu
              key="/help"
              title={
                <>
                  <IconQuestion /> {t("helpcenter")}
                </>
              }
              triggerProps={{
                trigger: "hover",
              }}
            >
              <Menu.SubMenu
                key="/external_links"
                title={
                  <>
                    <RiLinkM /> <span className="grow">{t("external_links")}</span>
                  </>
                }
              >
                <Menu.Item key="scriptcat/docs/dev/">
                  <a href={`${DocumentationSite}${localePath}/docs/dev/`} target="_blank" rel="noreferrer">
                    <RiFileCodeLine /> {t("api_docs")}
                  </a>
                </Menu.Item>
                <Menu.Item key="scriptcat/docs/learn/">
                  <a href="https://learn.scriptcat.org/docs/%E7%AE%80%E4%BB%8B/" target="_blank" rel="noreferrer">
                    <RiFileCodeLine /> {t("development_guide")}
                  </a>
                </Menu.Item>
                <Menu.Item key="scriptcat/userscript">
                  <a href="https://scriptcat.org/search" target="_blank" rel="noreferrer">
                    <IconLink /> {t("script_gallery")}
                  </a>
                </Menu.Item>
                <Menu.Item key="tampermonkey/bbs">
                  <a href="https://bbs.tampermonkey.net.cn/" target="_blank" rel="noreferrer">
                    <IconLink /> {t("community_forum")}
                  </a>
                </Menu.Item>
                <Menu.Item key="GitHub">
                  <a href="https://github.com/scriptscat/scriptcat" target="_blank" rel="noreferrer">
                    <IconGithub /> {"GitHub"}
                  </a>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Item
                key="/guide"
                onClick={() => {
                  guideRef.current?.open();
                }}
              >
                <RiGuideLine /> {t("guide")}
              </Menu.Item>
              <Menu.Item key="scriptcat/docs/use/">
                <a href={`${DocumentationSite}${localePath}/docs/use/`} target="_blank" rel="noreferrer">
                  <RiFileCodeLine /> {t("user_guide")}
                </a>
              </Menu.Item>
            </Menu.SubMenu>
            <MenuItem
              key="/collapsible"
              onClick={() => {
                localStorage.collapsed = !collapsed;
                setCollapsed(!collapsed);
              }}
            >
              {collapsed ? <IconLeft /> : <IconRight />} {t("hide_sidebar")}
            </MenuItem>
          </Menu>
        </div>
      </Layout.Sider>
      <Layout.Content
        style={{
          borderLeft: "1px solid var(--color-bg-5)",
          overflow: "hidden",
          padding: 10,
          height: "100%",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <Routes>
          <Route index element={<ScriptList />} />
          <Route path="/script/editor">
            <Route path=":uuid" element={<ScriptEditor />} />
            <Route path="" element={<ScriptEditor />} />
          </Route>
          <Route path="/subscribe" element={<SubscribeList />} />
          <Route path="/logger" element={<Logger />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/setting" element={<Setting />} />
          <Route path="/chat" element={<TestChat />} />
          <Route path="/models" element={<div className="p-4">Model Management Page (Under Construction)</div>} />
        </Routes>
      </Layout.Content>
    </HashRouter>
  );
};

export default Sider;
