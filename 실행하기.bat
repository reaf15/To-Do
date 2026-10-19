@echo off
chcp 65001 > nul
title 남양주체육문화센터 시설·공사 업무 공유 서버
cls
echo =======================================================================
echo     남양주체육문화센터 직원간 시설·공사 업무 공유 시스템 (NYJ Hub)
echo =======================================================================
echo.
echo  [1] 내 컴퓨터에서 접속:
echo      ▶ http://localhost:5173
echo.
echo  [2] 다른 직원 PC 및 스마트폰 접속 (사내 동일 Wi-Fi/유선랜):
echo      ▶ http://192.168.101.96:5173
echo.
echo  [3] 연동 앱: 시설본부 업무자료 실시간 자동 취합 시스템:
echo      ▶ http://localhost:3001 (사내망: http://192.168.101.96:3001)
echo.
echo  [진단 완료 상태]
echo   - 네트워크: 고정 IP (192.168.101.96) 사용 중 (IP 변경 없음)
echo   - 방화벽: Node.js 인바운드 허용 확인됨
echo   - 전원: 절전 모드 해제됨 (상시 구동 가능)
echo   - 데이터: data/tasks.json 실시간 중앙 동기화
echo.
echo  ※ 두 앱 상단 헤더에 상호 바로가기 링크가 연동되어 있습니다.
echo  ※ 창을 닫으면 서버가 종료되므로 사용 중에는 창을 '최소화'해 두세요.
echo =======================================================================
echo.

:: 시설본부 취합 포털(3001)이 꺼져 있다면 함께 시작
netstat -ano | findstr :3001 > nul
if %errorlevel% neq 0 (
  echo [안내] 연동 앱(시설본부 취합 포털 3001)을 함께 시작합니다...
  start "시설본부_자료취합_서버(3001)" /min cmd /c "cd /d C:\Projects\Office\cowork && node server.js"
)

start http://localhost:5173
if not exist dist (
  echo [최초 1회 빌드 진행 중...]
  npm run build
)
node server.js
pause
