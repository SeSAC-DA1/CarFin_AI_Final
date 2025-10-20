@echo off
REM CARFIN AI - Railway 배포 자동화 스크립트
REM 작성일: 2025-01-06

echo ========================================
echo  CARFIN AI - Railway 배포 시작
echo ========================================
echo.

REM 프로젝트 디렉토리로 이동
cd /d "%~dp0"

echo [1/5] Railway CLI 로그인 중...
echo 브라우저가 열립니다. Railway 계정으로 로그인하세요.
echo.
railway login
if errorlevel 1 (
    echo ❌ 로그인 실패! Railway CLI가 설치되어 있는지 확인하세요.
    echo.
    echo 설치 명령어: npm install -g @railway/cli
    pause
    exit /b 1
)

echo.
echo ✅ 로그인 성공!
echo.

echo [2/5] Railway 프로젝트 연결 중...
railway link
if errorlevel 1 (
    echo.
    echo 새 프로젝트를 생성하시겠습니까? (y/n)
    set /p create_new=
    if /i "%create_new%"=="y" (
        railway init
    ) else (
        echo ❌ 프로젝트 연결 취소
        pause
        exit /b 1
    )
)

echo.
echo ✅ 프로젝트 연결 완료!
echo.

echo [3/5] 환경 변수 확인 중...
echo.
echo ⚠️  Railway 대시보드에서 다음 환경 변수를 설정하세요:
echo.
echo     NODE_ENV=production
echo     PORT=5000
echo     DATABASE_URL=postgresql://...
echo     GOOGLE_API_KEY=AIza...
echo     GEMINI_API_KEY=AIza...
echo.
echo 설정하셨습니까? (y/n)
set /p env_ready=
if /i not "%env_ready%"=="y" (
    echo.
    echo Railway 대시보드를 엽니다...
    start https://railway.app/dashboard
    echo.
    echo 환경 변수 설정 후 다시 실행하세요.
    pause
    exit /b 1
)

echo.
echo ✅ 환경 변수 확인 완료!
echo.

echo [4/5] 프로덕션 빌드 실행 중...
call npm run build
if errorlevel 1 (
    echo ❌ 빌드 실패!
    pause
    exit /b 1
)

echo.
echo ✅ 빌드 성공!
echo.

echo [5/5] Railway 배포 시작...
echo.
railway up
if errorlevel 1 (
    echo ❌ 배포 실패!
    echo.
    echo 로그 확인:
    railway logs
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ 배포 완료!
echo ========================================
echo.
echo 배포 상태 확인:
railway status
echo.
echo 배포된 앱 열기:
railway open
echo.

pause
