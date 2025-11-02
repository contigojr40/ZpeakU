#!/bin/bash
cd "$(dirname "$0")" || exit
echo "🔄 Actualizando auditoría de estructura ZPEAKU™..."
mkdir -p _AUDIT/api _AUDIT/public _AUDIT/src _AUDIT/supabase

find ./api -type f > _AUDIT/api/files.txt
find ./public -type f > _AUDIT/public/files.txt
find ./src -type f > _AUDIT/src/files.txt
find ./supabase -type f > _AUDIT/supabase/files.txt
ls -R > _AUDIT/ZPEAKU_STRUCTURE.txt

echo "✅ Auditoría actualizada. Revisa la carpeta _AUDIT/"