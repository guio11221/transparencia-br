import { Transparencia } from '../dist/index.cjs';
import dotenv from 'dotenv';

dotenv.config();

const api = new Transparencia({
    apiKey: process.env.PORTAL_API_KEY,

    timeoutMs: 15000,
    retries: 2,

    rateLimit: {
        maxRequests: 150,
        windowMs: 60000,
        maxConcurrent: 3,
    },

    cache: {
        enabled: false,
    },
});

// Consultar múltiplos programas
async function getBeneficios() {
    const beneficios = await api.beneficios.consultar({
        nis: '20671770351',
        programas: [
            'bolsaFamilia',
            'novoBolsaFamilia',
            'bpc',
            'peti',
        ],
    });

    console.log(beneficios);
    return beneficios;
}
getBeneficios();

// Todos os auxílios aplicáveis a um NIS (6 com CPF, 9 com NIS)
async function getAuxilios() {
    const auxilios = await api.beneficios.porPessoa({ nis: '20671770351' });

    console.log(auxilios);
    return auxilios;
}
getAuxilios();

// Visão consolidada: auxílios + cartões + viagens + contratos + PEPs + sanções
async function getResumo() {
    const resumo = await api.pessoas.resumo({ nis: '20671770351' });

    console.log(resumo);
    return resumo;
}
getResumo();

// Cartões governamentais (CPGF/CPCC/DC) de quem recebe
async function getCartoes() {
    const cartoes = await api.cartoes.porPortador('20671770351');

    console.log(cartoes);
    return cartoes;
}
getCartoes();