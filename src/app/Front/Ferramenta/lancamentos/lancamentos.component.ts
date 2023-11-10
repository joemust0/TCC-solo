import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-lancamentos',
  templateUrl: './lancamentos.component.html',
  styleUrls: ['./lancamentos.component.css']
})
export class LancamentosComponent implements OnInit {
  tiposLancamento = ["Ativo", "Passivo", "Ativo não Circulante", "Passivo não Circulante", "Patrimônio Líquido"];
  contas = ["Caixa", "Banco", "Imobilizado", "Estoque", "Fornecedor", "Empréstimo", "Capital Social"];
  tipoLancamento: string = '';
  conta: string = '';
  valor: number = 0;
  nome: string = '';
  descricao: string = '';
  tipoLancamentoContrapartida: string = '';
  contrapartidaConta: string = '';
  contrapartidaValor: number = 0;
  camposDinamicos: any[] = [];
  @Input() columnsToShow: string[] = [];
  @Input() lancamentos: any[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Usando um evento para detectar alterações na rota
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Obtendo os dados do estado da rota
        const navigationState = this.route.snapshot?.root.firstChild?.data['state'];

        if (navigationState) {
          this.nome = navigationState.nome;
          this.descricao = navigationState.descricao;
        }
      });
  }

  gerarBalanco() {
    // Implemente a lógica para gerar o balanço aqui
    this.redirectToHome();
  }

  redirectToHome() {
    this.router.navigate(['/balanco']);
  }

  adicionarCampo() {
    const novoCampo = {
      tipo: '',
      conta: '',
      valor: 0,
      funcaoCredito: false
    };

    this.camposDinamicos.push({ ...novoCampo });
  }

  adicionarLancamento() {
    const totalCamposDinamicos = this.camposDinamicos.reduce((acc, campo) => {
      return campo.funcaoCredito ? acc + campo.valor : acc - campo.valor;
    }, 0);

    const margemErro = 0.01;

    if (Math.abs(this.valor - (this.contrapartidaValor + totalCamposDinamicos)) > margemErro) {
      alert('A contrapartida deve ter o mesmo valor do lançamento.');
      return;
    }

    const novoLancamento = {
      tipo: 'Débito',
      conta: this.conta,
      valor: this.valor,
      tipoLancamento: this.tipoLancamento,
      contrapartida: {
        tipo: 'Crédito',
        conta: this.contrapartidaConta,
        valor: this.contrapartidaValor
      },
      camposDinamicos: [...this.camposDinamicos]
    };

    this.lancamentos.push({ ...novoLancamento });
    this.limparCampos();

    const totalDebitos = this.lancamentos.reduce((acc, lancamento) => lancamento.tipo === 'Débito' ? acc + lancamento.valor : acc, 0);
    const totalCreditos = this.lancamentos.reduce((acc, lancamento) => lancamento.tipo === 'Crédito' ? acc + lancamento.valor : acc, 0);

    if (Math.abs(totalDebitos - totalCreditos) > margemErro) {
      alert('Existem diferenças nos valores de débito e crédito. Confira os valores lançados!');
    }
  }

  limparCampos() {
    this.tipoLancamento = '';
    this.conta = '';
    this.valor = 0;
    this.tipoLancamentoContrapartida = '';
    this.contrapartidaConta = '';
    this.contrapartidaValor = 0;
    this.camposDinamicos = [];
  }
}
