class Disciplina {
    constructor(nome, creditos, interesse, horarios, dias) {
        this.nome = nome;
        this.creditos = creditos;
        this.interesse = interesse;
        this.horarios = horarios;
        this.dias = dias;
    }
}

class GeradorGrade {
    constructor() {
        this.disciplinas = [];
    }

    adicionarDisciplina(disciplina) {
        this.disciplinas.push(disciplina);
        this.atualizarListaDisciplinas();
    }

    removerDisciplina(index) {
        this.disciplinas.splice(index, 1);
        this.atualizarListaDisciplinas();
    }

    temConflito(disciplina1, disciplina2) {
        // Verifica se há interseção entre os dias
        const diasComuns = disciplina1.dias.filter(dia => disciplina2.dias.includes(dia));
        
        // Se não há dias em comum, não há conflito
        if (diasComuns.length === 0) {
            return false;
        }
        
        // Se há dias em comum, verifica conflito de horários
        return disciplina1.horarios.some(h1 => disciplina2.horarios.includes(h1));
    }

    knapsackComHorarios(maxCreditos, optimizationStrategy = 'credits') {
        const n = this.disciplinas.length;
        // Ordenar disciplinas por créditos quando estiver maximizando créditos
        let disciplinasOrdenadas = [...this.disciplinas];
        if (optimizationStrategy === 'credits') {
            disciplinasOrdenadas.sort((a, b) => b.creditos - a.creditos);
        }

        const dp = Array(n + 1).fill().map(() => 
            Array(maxCreditos + 1).fill().map(() => ({
                creditos: 0,
                interesse: 0,
                selecionadas: []
            }))
        );

        for (let i = 1; i <= n; i++) {
            const disciplina = disciplinasOrdenadas[i - 1];
            
            for (let w = 0; w <= maxCreditos; w++) {
                // Copiar estado anterior
                dp[i][w] = {
                    creditos: dp[i-1][w].creditos,
                    interesse: dp[i-1][w].interesse,
                    selecionadas: [...dp[i-1][w].selecionadas]
                };

                if (w >= disciplina.creditos) {
                    const disciplinasSelecionadas = dp[i-1][w - disciplina.creditos].selecionadas;
                    const temConflito = disciplinasSelecionadas.some(d => 
                        this.temConflito(d, disciplina)
                    );

                    if (!temConflito) {
                        const novosCreditos = dp[i-1][w - disciplina.creditos].creditos + disciplina.creditos;
                        const novoInteresse = dp[i-1][w - disciplina.creditos].interesse + disciplina.interesse;
                        
                        let deveAtualizar = false;

                        if (optimizationStrategy === 'credits') {
                            // Quando maximizando créditos, SEMPRE atualiza se tiver mais créditos
                            deveAtualizar = novosCreditos > dp[i][w].creditos;
                        } else {
                            // Quando maximizando interesse
                            if (novoInteresse > dp[i][w].interesse) {
                                deveAtualizar = true;
                            } else if (novoInteresse === dp[i][w].interesse) {
                                deveAtualizar = novosCreditos > dp[i][w].creditos;
                            }
                        }

                        if (deveAtualizar) {
                            dp[i][w] = {
                                creditos: novosCreditos,
                                interesse: novoInteresse,
                                selecionadas: [...disciplinasSelecionadas, disciplina]
                            };
                        }
                    }
                }
            }
        }

        // Encontrar a solução com mais créditos quando estiver maximizando créditos
        if (optimizationStrategy === 'credits') {
            let melhorSolucao = dp[n][maxCreditos];
            // Procurar em todas as soluções possíveis dentro do limite de créditos
            for (let w = maxCreditos; w >= 0; w--) {
                if (dp[n][w].creditos > melhorSolucao.creditos) {
                    melhorSolucao = dp[n][w];
                }
            }
            return {
                ...melhorSolucao,
                optimizationStrategy
            };
        }

        return {
            ...dp[n][maxCreditos],
            optimizationStrategy
        };
    }

    exibirGradeOtimizada(resultado) {
        const container = document.getElementById('grade-resultado');
        container.innerHTML = '';

        if (resultado.selecionadas.length === 0) {
            container.innerHTML = '<div class="alert alert-warning">Nenhuma disciplina pôde ser alocada com as restrições atuais.</div>';
            return;
        }

        resultado.selecionadas.forEach(disc => {
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <h5 class="mb-1">${disc.nome}</h5>
                <div class="d-flex gap-2 mb-2">
                    <span class="badge bg-primary">Créditos: ${disc.creditos}</span>
                    <span class="badge bg-info">Interesse: ${disc.interesse}</span>
                </div>
                <div class="d-flex flex-wrap gap-1 mb-2">
                    <strong class="me-2">Dias:</strong>
                    ${disc.dias.map(d => `<span class="badge bg-secondary">${d}</span>`).join('')}
                </div>
                <div class="d-flex flex-wrap gap-1">
                    <strong class="me-2">Horários:</strong>
                    ${disc.horarios.map(h => {
                        const isMorning = h.startsWith('M');
                        return `<span class="badge ${isMorning ? 'bg-info' : 'bg-warning'}">${h}</span>`;
                    }).join('')}
                </div>
            `;
            container.appendChild(div);
        });

        const sumarioTexto = resultado.optimizationStrategy === 'credits' 
            ? 'Total de Créditos Maximizado'
            : 'Interesse Total Maximizado';

        document.getElementById('sumario').innerHTML = `
            <h5 class="alert-heading">${sumarioTexto}</h5>
            <div class="d-flex gap-3">
                <div>
                    <strong>Total de Créditos:</strong>
                    <span class="badge bg-primary ms-2">${resultado.creditos}</span>
                </div>
                <div>
                    <strong>Interesse Médio:</strong>
                    <span class="badge bg-info ms-2">${(resultado.interesse / resultado.selecionadas.length).toFixed(1)}</span>
                </div>
            </div>
        `;
    }

    atualizarListaDisciplinas() {
        const container = document.getElementById('lista-disciplinas');
        container.innerHTML = '';

        this.disciplinas.forEach((disc, index) => {
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">${disc.nome}</h5>
                        <div class="d-flex gap-2 mb-2">
                            <span class="badge bg-primary">Créditos: ${disc.creditos}</span>
                            <span class="badge bg-info">Interesse: ${disc.interesse}</span>
                        </div>
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            <strong class="me-2">Dias:</strong>
                            ${disc.dias.map(d => `<span class="badge bg-secondary">${d}</span>`).join('')}
                        </div>
                        <div class="d-flex flex-wrap gap-1">
                            <strong class="me-2">Horários:</strong>
                            ${disc.horarios.map(h => {
                                const isMorning = h.startsWith('M');
                                return `<span class="badge ${isMorning ? 'bg-info' : 'bg-warning'}">${h}</span>`;
                            }).join('')}
                        </div>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" onclick="gerador.removerDisciplina(${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }
}

// Inicialização
const gerador = new GeradorGrade();

document.getElementById('adicionar').addEventListener('click', () => {
    const nome = document.getElementById('disciplina').value;
    const creditos = parseInt(document.getElementById('creditos').value);
    const interesse = parseInt(document.getElementById('interesse').value);
    
    const horariosSelecionados = Array.from(document.querySelectorAll('input[name="horario"]:checked'))
        .map(input => input.value);
    
    const diasSelecionados = Array.from(document.querySelectorAll('input[name="dia"]:checked'))
        .map(input => input.value);

    if (!nome || !creditos || !interesse || horariosSelecionados.length === 0 || diasSelecionados.length === 0) {
        alert('Por favor, preencha todos os campos e selecione pelo menos um horário e um dia da semana.');
        return;
    }

    const disciplina = new Disciplina(nome, creditos, interesse, horariosSelecionados, diasSelecionados);
    gerador.adicionarDisciplina(disciplina);

    // Limpar formulário
    document.getElementById('disciplina').value = '';
    document.getElementById('creditos').value = '';
    document.getElementById('interesse').value = '';
    document.querySelectorAll('input[name="horario"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="dia"]').forEach(input => input.checked = false);
});

document.getElementById('gerar').addEventListener('click', () => {
    const maxCreditos = parseInt(document.getElementById('max-creditos').value);
    const optimizationStrategy = document.getElementById('optimization-strategy').value;
    
    if (!maxCreditos) {
        alert('Por favor, defina o máximo de créditos desejado.');
        return;
    }

    const resultado = gerador.knapsackComHorarios(maxCreditos, optimizationStrategy);
    gerador.exibirGradeOtimizada(resultado);
});