class Disciplina {
    constructor(nome, creditos, interesse, horarios, dias) {
        this.nome = nome;
        this.creditos = creditos;
        this.interesse = interesse;
        this.horarios = horarios;
        this.dias = dias;
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