package eu.sabotino.cuboclast;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

import java.io.IOException;
import java.io.InputStream;

public class MainActivity extends Activity {
    private static final String TAG = "CuboClast";
    private WebView webView;
    private long lastBackTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        applyImmersive();

        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#04060A"));
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        final WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/", new WebViewAssetLoader.PathHandler() {
                    @Override
                    public WebResourceResponse handle(String path) {
                        try {
                            String cleanPath = path;
                            if (cleanPath.startsWith("/")) {
                                cleanPath = cleanPath.substring(1);
                            }
                            if (cleanPath.isEmpty()) {
                                cleanPath = "index.html";
                            }
                            String assetPath = "www/" + cleanPath;

                            InputStream is = getAssets().open(assetPath);
                            String mimeType = "application/octet-stream";
                            if (assetPath.endsWith(".html")) mimeType = "text/html";
                            else if (assetPath.endsWith(".js") || assetPath.endsWith(".mjs")) mimeType = "application/javascript";
                            else if (assetPath.endsWith(".css")) mimeType = "text/css";
                            else if (assetPath.endsWith(".png")) mimeType = "image/png";
                            else if (assetPath.endsWith(".jpg") || assetPath.endsWith(".jpeg")) mimeType = "image/jpeg";
                            else if (assetPath.endsWith(".svg")) mimeType = "image/svg+xml";
                            else if (assetPath.endsWith(".json") || assetPath.endsWith(".webmanifest")) mimeType = "application/json";
                            else if (assetPath.endsWith(".woff2")) mimeType = "font/woff2";
                            else if (assetPath.endsWith(".woff")) mimeType = "font/woff";
                            else if (assetPath.endsWith(".ico")) mimeType = "image/x-icon";

                            return new WebResourceResponse(mimeType, "UTF-8", is);
                        } catch (IOException e) {
                            Log.w(TAG, "Asset not found: " + path);
                            return null;
                        }
                    }
                })
                .build();

        webView.setWebViewClient(new WebViewClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return assetLoader.shouldInterceptRequest(request.getUrl());
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "[Console] " + consoleMessage.message() + " (" + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + ")");
                return true;
            }
        });

        setContentView(webView);
        webView.loadUrl("https://appassets.androidplatform.net/index.html");
    }

    private void applyImmersive() {
        try {
            Window window = getWindow();
            if (window == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                WindowManager.LayoutParams lp = window.getAttributes();
                lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                window.setAttributes(lp);
            }

            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);

            View decorView = window.getDecorView();
            if (decorView != null) {
                decorView.setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                                | View.SYSTEM_UI_FLAG_FULLSCREEN
                                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                WindowInsetsController controller = window.getInsetsController();
                if (controller != null) {
                    controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            }
        } catch (Throwable t) {
            Log.e(TAG, "applyImmersive error", t);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applyImmersive();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        applyImmersive();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
    }

    @Override
    public void onBackPressed() {
        long now = SystemClock.elapsedRealtime();
        if (lastBackTime > 0 && now - lastBackTime < 2000) {
            finish();
        } else {
            lastBackTime = now;
            Toast.makeText(this, "Premi di nuovo per uscire", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
