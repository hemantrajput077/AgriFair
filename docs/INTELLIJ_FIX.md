# IntelliJ IDEA Compilation Errors - Fix Guide

## Problem
IntelliJ IDEA cannot find Spring Framework classes (JpaRepository, Authentication, MultipartFile, etc.) causing compilation errors.

## Root Cause
This is typically a Maven dependency indexing issue in IntelliJ IDEA. The IDE hasn't properly loaded the Maven dependencies.

## Solutions (Try in Order)

### Solution 1: Refresh Maven Project
1. Open IntelliJ IDEA
2. Right-click on `backend/pom.xml` (or the root `pom.xml` if it exists)
3. Select **Maven** → **Reload Project**
4. Wait for Maven to download dependencies
5. Check if errors are resolved

### Solution 2: Invalidate Caches and Restart
1. Go to **File** → **Invalidate Caches...**
2. Check all options
3. Click **Invalidate and Restart**
4. Wait for IntelliJ to restart and re-index

### Solution 3: Reimport Maven Project
1. Open **File** → **Settings** (or **Preferences** on Mac)
2. Go to **Build, Execution, Deployment** → **Build Tools** → **Maven**
3. Click **Import Maven projects automatically**
4. Click **Apply** and **OK**
5. Right-click on `pom.xml` → **Maven** → **Reload Project**

### Solution 4: Check pom.xml Location
Ensure `pom.xml` is in the correct location:
- Should be at: `backend/pom.xml` (root of backend module)
- If it's in `docs/pom.xml`, copy it to `backend/pom.xml`

### Solution 5: Manual Maven Build
1. Open terminal in IntelliJ
2. Navigate to `backend` directory
3. Run: `mvn clean install`
4. Wait for build to complete
5. Refresh IntelliJ project

### Solution 6: Check Project SDK
1. Go to **File** → **Project Structure** (Ctrl+Alt+Shift+S)
2. Under **Project**, ensure:
   - **Project SDK**: Java 17
   - **Project language level**: 17
3. Under **Modules**, ensure the backend module has:
   - **Language level**: 17
4. Click **Apply** and **OK**

### Solution 7: Check Maven Settings
1. Go to **File** → **Settings** → **Build Tools** → **Maven**
2. Ensure:
   - **Maven home path**: Points to correct Maven installation
   - **User settings file**: Points to correct settings.xml
   - **Local repository**: Points to correct .m2 repository
3. Click **Apply** and **OK**

## Quick Fix Applied
I've updated `CropController.java` to use fully qualified class names to avoid import conflicts:
- Changed `Authentication` to `org.springframework.security.core.Authentication`
- Added null checks for Authentication

## After Fixing
Once Maven dependencies are loaded:
1. All Spring classes should be recognized
2. Compilation errors should disappear
3. Auto-completion should work
4. You can run the application

## If Issues Persist
1. Check if Maven is installed: `mvn --version`
2. Check if Java 17 is installed: `java -version`
3. Try building from command line: `cd backend && mvn clean install`
4. If command line build works but IDE doesn't, it's definitely an IDE indexing issue

## Note
The code itself is correct. This is purely an IDE/Maven configuration issue. The application should compile and run fine from command line using Maven.

