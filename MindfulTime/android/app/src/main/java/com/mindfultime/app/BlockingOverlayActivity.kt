package com.mindfultime.app

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.view.View

/**
 * Activity care se afișează când utilizatorul încearcă să acceseze o aplicație blocată
 * Oferă un ecran "gentle blocking" cu opțiuni de a reveni la aplicația principală
 */
class BlockingOverlayActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Setează layout-ul
        val rootView = createBlockingLayout()
        setContentView(rootView)

        // Obține informații despre aplicația blocată
        val blockedPackage = intent.getStringExtra("blocked_package")
        val appName = getAppName(blockedPackage)

        // Configurează UI-ul
        setupUI(appName)
    }

    /**
     * Creează layout-ul programatic (fără XML)
     */
    private fun createBlockingLayout(): View {
        val layout = android.widget.LinearLayout(this)
        layout.orientation = android.widget.LinearLayout.VERTICAL
        layout.setBackgroundColor(android.graphics.Color.parseColor("#F5F5F5"))
        layout.setPadding(48, 48, 48, 48)
        layout.gravity = android.view.Gravity.CENTER

        // Icon
        val icon = ImageView(this)
        icon.setImageResource(android.R.drawable.ic_dialog_alert)
        val iconParams = android.widget.LinearLayout.LayoutParams(
            200, 200
        )
        iconParams.gravity = android.view.Gravity.CENTER
        iconParams.bottomMargin = 32
        layout.addView(icon, iconParams)

        // Title
        val title = TextView(this)
        title.id = View.generateViewId()
        title.textSize = 24f
        title.setTextColor(android.graphics.Color.parseColor("#333333"))
        title.gravity = android.view.Gravity.CENTER
        val titleParams = android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        )
        titleParams.bottomMargin = 16
        layout.addView(title, titleParams)

        // Message
        val message = TextView(this)
        message.id = View.generateViewId()
        message.textSize = 16f
        message.setTextColor(android.graphics.Color.parseColor("#666666"))
        message.gravity = android.view.Gravity.CENTER
        val messageParams = android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        )
        messageParams.bottomMargin = 48
        layout.addView(message, messageParams)

        // Button Container
        val buttonContainer = android.widget.LinearLayout(this)
        buttonContainer.orientation = android.widget.LinearLayout.VERTICAL
        buttonContainer.gravity = android.view.Gravity.CENTER
        val containerParams = android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        )
        layout.addView(buttonContainer, containerParams)

        // Go Home Button
        val goHomeButton = Button(this)
        goHomeButton.id = View.generateViewId()
        goHomeButton.text = "Înapoi la MindfulTime"
        goHomeButton.setBackgroundColor(android.graphics.Color.parseColor("#6366F1"))
        goHomeButton.setTextColor(android.graphics.Color.WHITE)
        goHomeButton.setPadding(64, 32, 64, 32)
        val homeButtonParams = android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        )
        homeButtonParams.bottomMargin = 16
        buttonContainer.addView(goHomeButton, homeButtonParams)

        // Go Back Button
        val goBackButton = Button(this)
        goBackButton.id = View.generateViewId()
        goBackButton.text = "Înapoi"
        goBackButton.setBackgroundColor(android.graphics.Color.parseColor("#E5E7EB"))
        goBackButton.setTextColor(android.graphics.Color.parseColor("#333333"))
        goBackButton.setPadding(64, 32, 64, 32)
        val backButtonParams = android.widget.LinearLayout.LayoutParams(
            android.widget.LinearLayout.LayoutParams.MATCH_PARENT,
            android.widget.LinearLayout.LayoutParams.WRAP_CONTENT
        )
        buttonContainer.addView(goBackButton, backButtonParams)

        // Store references
        layout.setTag(android.R.id.title, title)
        layout.setTag(android.R.id.message, message)
        layout.setTag(android.R.id.button1, goHomeButton)
        layout.setTag(android.R.id.button2, goBackButton)

        return layout
    }

    /**
     * Configurează UI-ul cu informații despre aplicația blocată
     */
    private fun setupUI(appName: String?) {
        val rootView = findViewById<View>(android.R.id.content).rootView
        val title = rootView.getTag(android.R.id.title) as TextView
        val message = rootView.getTag(android.R.id.message) as TextView
        val goHomeButton = rootView.getTag(android.R.id.button1) as Button
        val goBackButton = rootView.getTag(android.R.id.button2) as Button

        title.text = "Aplicație Blocată"
        message.text = if (appName != null) {
            "Ai atins limita de timp pentru $appName.\n\n" +
            "Completează o activitate mindful pentru a câștiga mai mult timp!"
        } else {
            "Ai atins limita de timp pentru această aplicație.\n\n" +
            "Completează o activitate mindful pentru a câștiga mai mult timp!"
        }

        goHomeButton.setOnClickListener {
            openMindfulTime()
        }

        goBackButton.setOnClickListener {
            goToHomeScreen()
        }
    }

    /**
     * Obține numele aplicației din package name
     */
    private fun getAppName(packageName: String?): String? {
        if (packageName == null) return null

        return try {
            val packageManager = applicationContext.packageManager
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: PackageManager.NameNotFoundException) {
            null
        }
    }

    /**
     * Deschide aplicația MindfulTime
     */
    private fun openMindfulTime() {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
        }
        finish()
    }

    /**
     * Merge la ecranul home
     */
    private fun goToHomeScreen() {
        val intent = Intent(Intent.ACTION_MAIN)
        intent.addCategory(Intent.CATEGORY_HOME)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        startActivity(intent)
        finish()
    }

    /**
     * Blochează back button
     */
    override fun onBackPressed() {
        // Redirecționează către home în loc să permită revenirea la aplicația blocată
        goToHomeScreen()
    }
}
