# Observabilidade do PC de performance

O k6 envia a latência por rota direto do workflow (`perf-api.yml`). Este Alloy
complementa com **CPU/RAM por container**, **métricas do host** e **logs**, tudo no
mesmo Grafana Cloud, para cruzar "a rota ficou lenta" com "a API bateu em 1 vCPU".

Ele roda no Debian, fora do workflow, e fica de pé entre as rodadas.

## Instalar no Debian

```bash
cd api/perf/observability
cp .env.example .env
chmod 600 .env
nano .env                 # preencha os 5 valores (veja os comentários do arquivo)
docker compose up -d
docker logs perf-alloy    # não deve ter erro de sintaxe nem 401/403
```

Interface de depuração (só local): `http://127.0.0.1:12345`. De outra máquina, use
um túnel SSH ou o Tailscale.

## Conferir que está chegando

Rode uma rodada do workflow e, no **Explore** do Grafana:

- Métricas (fonte `grafanacloud-...-prom`):
  - `container_cpu_usage_seconds_total{name="mintly-perf-api"}`
  - `container_memory_working_set_bytes{name="mintly-perf-api"}`
  - `node_cpu_seconds_total{host="debian-perf"}`
- Logs (fonte `grafanacloud-...-logs`): `{container="mintly-perf-api"}`

Os containers do teste só existem durante a rodada; fora dela não há série nova.

## Limites do plano grátis

- Métricas: 10 mil séries ativas, 14 dias de retenção. O cAdvisor está restrito a
  cpu/memória/rede/disco e a `mintly-perf-*`; o host a 6 coletores.
- Logs: a API loga cada requisição. `stage.limit` no `config.alloy` descarta o que
  passar de 200 linhas/s para não estourar a cota. Ajuste lá se precisar de mais.

## Segurança

- O container é `privileged` (o cAdvisor exige) e monta o socket do Docker: é root
  no host. Só use este compose no PC de teste.
- O `.env` tem o token de escrita do Alloy. Fica só no Debian (`chmod 600`), fora do
  git e fora dos secrets do GitHub. Se vazar, revogue a policy `mintly-perf-alloy` no
  Grafana Cloud e gere outra.
