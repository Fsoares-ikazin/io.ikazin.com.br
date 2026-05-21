#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
Uso:
  ./publish_build_hls.sh <build_number> <input_mp4> <mc_alias> <bucket>

Exemplo:
  ./publish_build_hls.sh 1 /home/phtech/videos/build-01-master.mp4 myminio ikazin-media

Fluxo:
  1. Faz upload do master para:
     ikazin/builds/<build_number>/source/master.mp4
  2. Gera HLS single bitrate 720p com ffmpeg
  3. Faz upload para:
     ikazin/builds/<build_number>/hls/
  4. Mostra os arquivos publicados
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 4 ]]; then
  usage
  exit 1
fi

BUILD_NUMBER="$1"
INPUT_MP4="$2"
MC_ALIAS="$3"
BUCKET="$4"

if ! [[ "$BUILD_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "Erro: build_number deve ser numerico."
  exit 1
fi

if [[ ! -f "$INPUT_MP4" ]]; then
  echo "Erro: arquivo de entrada nao encontrado: $INPUT_MP4"
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Erro: ffmpeg nao encontrado no PATH."
  echo "Instale com: sudo apt update && sudo apt install -y ffmpeg"
  exit 1
fi

if ! command -v mc >/dev/null 2>&1; then
  echo "Erro: mc (MinIO Client) nao encontrado no PATH."
  echo "Instale em Ubuntu:"
  echo "  curl -fsSL https://dl.min.io/client/mc/release/linux-amd64/mc -o mc"
  echo "  chmod +x mc && sudo mv mc /usr/local/bin/"
  exit 1
fi

if ! mc alias list | rg -q "^${MC_ALIAS}[[:space:]]" ; then
  echo "Erro: alias '$MC_ALIAS' nao configurado no mc."
  echo "Exemplo:"
  echo "  mc alias set $MC_ALIAS http://SEU-ENDPOINT MINIO_ACCESS_KEY MINIO_SECRET_KEY"
  exit 1
fi

WORKDIR="/tmp/ikazin-hls/build-${BUILD_NUMBER}"
SOURCE_PREFIX="ikazin/builds/${BUILD_NUMBER}/source"
TARGET_PREFIX="ikazin/builds/${BUILD_NUMBER}/hls"

echo "==> Limpando diretorio temporario: $WORKDIR"
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"

echo "==> Gerando HLS single bitrate para build ${BUILD_NUMBER}"
ffmpeg -y \
  -i "$INPUT_MP4" \
  -vf "scale=-2:720" \
  -c:v libx264 \
  -preset veryfast \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -f hls \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_segment_filename "${WORKDIR}/segment_%03d.ts" \
  "${WORKDIR}/index.m3u8"

if [[ ! -f "${WORKDIR}/index.m3u8" ]]; then
  echo "Erro: ffmpeg nao gerou index.m3u8"
  exit 1
fi

echo "==> Arquivos gerados localmente"
ls -la "$WORKDIR"

echo "==> Criando bucket/prefixo se necessario"
mc mb --ignore-existing "${MC_ALIAS}/${BUCKET}" >/dev/null

echo "==> Fazendo upload do master para ${MC_ALIAS}/${BUCKET}/${SOURCE_PREFIX}/master.mp4"
mc cp "$INPUT_MP4" "${MC_ALIAS}/${BUCKET}/${SOURCE_PREFIX}/master.mp4"

echo "==> Fazendo upload para ${MC_ALIAS}/${BUCKET}/${TARGET_PREFIX}/"
mc cp --recursive "${WORKDIR}/" "${MC_ALIAS}/${BUCKET}/${TARGET_PREFIX}/"

echo "==> Conferindo publicacao"
mc ls --recursive "${MC_ALIAS}/${BUCKET}/${SOURCE_PREFIX}/"
mc ls --recursive "${MC_ALIAS}/${BUCKET}/${TARGET_PREFIX}/"

cat <<EOF

Publicacao concluida.

Build number: ${BUILD_NUMBER}
Master esperado:
  ${SOURCE_PREFIX}/master.mp4

Manifesto esperado:
  ${TARGET_PREFIX}/index.m3u8

Proximo passo:
  Abrir /orgs/[slug]/build/${BUILD_NUMBER}
EOF
