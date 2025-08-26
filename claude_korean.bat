@echo off
rem Claude를 한국어 모드로 실행하는 배치 파일
claude --append-system-prompt "항상 한국어로 응답하세요. 모든 설명과 메시지를 한국어로 작성하세요." %*