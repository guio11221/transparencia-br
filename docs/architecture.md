# Arquitetura

`client` compõe os serviços. `modules` define consultas e DTOs. `core/contracts` estabelece a porta HTTP. `core/http` implementa o adaptador Fetch. Não acople módulos a frameworks web.

As respostas de módulos sem esquema confirmado são deliberadamente `Record<string, unknown>`: não invente campos tipados.
