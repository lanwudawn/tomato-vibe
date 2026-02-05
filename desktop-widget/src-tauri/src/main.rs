#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  image::Image,
  tray::TrayIconBuilder,
  Manager,
};

#[tauri::command]
fn close_window(window: tauri::Window) {
  window.close().unwrap();
}

#[tauri::command]
fn minimize_window(window: tauri::Window) {
  window.minimize().unwrap();
}

#[tauri::command]
fn open_web_app(_window: tauri::Window) {
  std::process::Command::new("cmd")
    .args(["/c", "start", "http://localhost:3000"])
    .spawn()
    .ok();
}

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate![close_window, minimize_window, open_web_app])
    .setup(|app| {
      let window = app.get_webview_window("main").unwrap();
      
      let _tray_icon = TrayIconBuilder::new()
        .tooltip("番茄钟 Widget")
        .on_tray_icon_event(|tray_icon, event| {
          if let tauri::tray::TrayIconEvent::Click { button: tauri::tray::MouseButton::Left, .. } = event {
            let app = tray_icon.app_handle();
            if let Some(window) = app.get_webview_window("main") {
              window.show().ok();
              window.set_focus().ok();
            }
          }
        })
        .menu(tauri::tray::TrayMenu::with_items([
          tauri::tray::TrayMenuItem::with_id(app, "open", "打开番茄钟", true, None::<&str>)?,
          tauri::tray::TrayMenuItem::with_id(app, "separator", "-", false, None::<&str>)?,
          tauri::tray::TrayMenuItem::with_id(app, "quit", "退出", true, None::<&str>)?,
        ]))
        .icon(Image::from_bytes(include_bytes!("../icons/tray.png"))?)
        .build(app)?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
