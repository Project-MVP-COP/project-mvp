#!/bin/bash

# ── 경로 변수 설정 ─────────────────────────────────
STAGE_DIR="/opt/deploy_stage"
WORK_DIR="/opt/backend-app"
DEPLOY_JAR="$STAGE_DIR/build.jar"
RUN_JAR="$WORK_DIR/app.jar"

echo "==== 배포 시작 ===="

# ── Step 1: JAR 파일을 워킹 디렉토리로 이동 ────────
echo "> JAR 파일을 워킹 디렉토리로 이동합니다."
mv $DEPLOY_JAR $RUN_JAR

# ── Step 2: 현재 실행 중인 앱 종료 ─────────────────
echo "> 현재 실행 중인 앱의 PID를 확인합니다."
CURRENT_PID=$(pgrep -f app.jar)

if [ -z "$CURRENT_PID" ]; then
    echo "> 실행 중인 앱이 없습니다. 종료 단계를 건너뜁니다."
else
    echo "> 기존 앱을 종료합니다. (PID: $CURRENT_PID)"
    kill -15 $CURRENT_PID
    sleep 5    # 프로세스가 완전히 내려갈 때까지 대기
fi

# ── Step 3: 새 앱 실행 ──────────────────────────────
echo "> 새 앱을 실행합니다."
cd $WORK_DIR
nohup java -Xmx512m \
  -DDB_URL=$DB_URL \
  -DDB_USERNAME=$DB_USERNAME \
  -DDB_PASSWORD=$DB_PASSWORD \
  -jar app.jar \
  --spring.profiles.active=prod \
  > app.log 2>&1 &


echo "==== 배포 완료 ===="