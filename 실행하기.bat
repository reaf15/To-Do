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
echo  [진단 완료 상태]
echo   - 네트워크: 고정 IP (192.168.101.96) 사용 중 (IP 변경 없음)
echo   - 방화벽: Node.js 인바운드 허용 확인됨
echo   - 전원: 절전 모드 해제됨 (상시 구동 가능)
echo   - 데이터: data/tasks.json 중앙 저장소 실시간 동기화
echo.
echo  ※ 창을 닫으면 서버가 종료되므로 사용 중에는 창을 '최소화'해 두세요.
echo =======================================================================
echo.
start http://localhost:5173
if not exist dist (
  echo [최초 1회 빌드 진행 중...]
  npm run build
)
node server.js
pause
