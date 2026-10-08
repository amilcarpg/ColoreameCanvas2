import org.gradle.api.Action
import org.gradle.api.execution.TaskExecutionGraph
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import java.util.Properties
import java.util.Base64

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
if (keystorePropertiesFile.exists()) {
    keystorePropertiesFile.inputStream().use { keystoreProperties.load(it) }
}
val adMobAppId = providers.gradleProperty("ADMOB_APP_ID")
    .orElse(providers.environmentVariable("ADMOB_APP_ID"))
    .orNull



// Dart defines are the single environment contract for the app and its native manifest.
val dartDefines = (providers.gradleProperty("dart-defines").orNull ?: "")
    .split(",").filter { it.isNotBlank() }.associate { encoded ->
        val decoded = String(Base64.getDecoder().decode(encoded), Charsets.UTF_8)
        val parts = decoded.split("=", limit = 2)
        parts[0] to parts.getOrElse(1) { "" }
    }
val adsEnvironment = dartDefines["PAINTME_ADS"] ?: "disabled"
val productionAds = adsEnvironment == "production"
val testAppId = "ca-app-pub-3940256099942544~3347511713"
val analyticsConfigured = dartDefines["PAINTME_ANALYTICS"] == "true" &&
    dartDefines["PAINTME_ANALYTICS_REVIEWED"] == "true" &&
    Regex("^AIza[A-Za-z0-9_-]{35}$").matches(dartDefines["FIREBASE_API_KEY"] ?: "") &&
    Regex("^1:[0-9]+:android:[a-f0-9]+$").matches(dartDefines["FIREBASE_APP_ID"] ?: "") &&
    Regex("^[a-z][a-z0-9-]{4,28}[a-z0-9]$").matches(dartDefines["FIREBASE_PROJECT_ID"] ?: "") &&
    Regex("^[0-9]+$").matches(dartDefines["FIREBASE_MESSAGING_SENDER_ID"] ?: "")

android {
    namespace = "club.paintme.paintme_app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }


    defaultConfig {
        applicationId = "club.paintme.paintme_app"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        manifestPlaceholders["ADMOB_APP_ID"] =
            if (productionAds) adMobAppId ?: "MISSING_PRODUCTION_ADMOB_APP_ID" else testAppId
        manifestPlaceholders["FIREBASE_ANALYTICS_DEACTIVATED"] = (!analyticsConfigured).toString()
    }

    signingConfigs {
        create("release") {
            keyAlias = keystoreProperties["keyAlias"] as String?
            keyPassword = keystoreProperties["keyPassword"] as String?
            storeFile = keystoreProperties["storeFile"]?.let { file(it) }
            storePassword = keystoreProperties["storePassword"] as String?
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
        }
    }
}

kotlin { compilerOptions { jvmTarget.set(JvmTarget.JVM_17) } }

gradle.taskGraph.whenReady(object : Action<TaskExecutionGraph> {
  override fun execute(graph: TaskExecutionGraph) {
    val releaseBuild = graph.allTasks.any { it.project == project && it.name.contains("Release", ignoreCase = true) }
    val profileBuild = graph.allTasks.any { it.project == project && it.name.contains("Profile", ignoreCase = true) }
    if (releaseBuild || profileBuild) {
        check(adsEnvironment == "disabled" || productionAds) { "Release/profile allow disabled or approved production advertising, never test." }
        if (productionAds) {
            check(dartDefines["PAINTME_ADS_APPROVED"] == "true") { "Production advertising requires explicit approval." }
            check(adMobAppId != null && Regex("^ca-app-pub-[0-9]{16}~[0-9]{10}$").matches(adMobAppId) && !adMobAppId.startsWith("ca-app-pub-3940256099942544")) { "Set a confirmed production ADMOB_APP_ID." }
            val bannerId = dartDefines["ADMOB_BANNER_ID"] ?: ""
            check(Regex("^ca-app-pub-[0-9]{16}/[0-9]{10}$").matches(bannerId) && !bannerId.startsWith("ca-app-pub-3940256099942544")) { "Set a confirmed production ADMOB_BANNER_ID." }
        }
        check(!releaseBuild || keystorePropertiesFile.exists()) {
            "Create android/key.properties with the release signing values before building a release."
        }
    }
  }
})

flutter {
    source = "../.."
}
