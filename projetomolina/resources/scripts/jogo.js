class Disco {
    constructor(a) {
        //Define a div do disco, atribuindo seu id e seu titulo, além de conceder a classe disc.
        this.el = jQuery('<div id="disc-' + a.id + '" title="Disco ' + a.id + '" class="disc"></div>');
        //Atribuição de caracteristicas ao elemento via css
        this.el.css({
            'width': a.width,
            'height': a.height,
            'margin-left': a.margin,
            'background': a.background,
        });
        return true;
    }
    getId() {
        return this.id;
    }
    getDisc() {
        return this.el;
    }
}

class Haste {
    constructor(a) {
        //Criação da haste
        this.discs = [];
        this.container = jQuery('<div class="peg-container"></div>');
        this.peg = jQuery('<div class="peg" id="peg-' + (a + 1) + '"></div>');
        this.id = a + 1;
        this.label = jQuery('<div class="peg-label"> </div>');
        this.container.append(this.peg);
        this.container.append(this.label);
        return true;
    }
    //Retorna o disco do topo, ou null
    top() {
        return this.discs.length > 0 ? this.discs[0] : null;
    }
    //Se houver elementos na haste, insere-se os valores ao inicio da pilha, caso contrário, ele adiciona ao seu fim, logo na primeira posição
    push(disc) {
        if (this.discs.length > 0) {
            this.discs.unshift(disc);
        }
        else {
            this.discs.push(disc);
        }
    }
    //Remove-se o primeiro disco da pilha.
    pop() {
        var disc = this.discs.shift();
        return disc;
    }
    getPegContainer() {
        return this.container;
    }
    getPeg() {
        return this.peg;
    }
}

var Game=function(b){
    //Inicializa as opções do jogo com o numero de hastes e discos, além de seus tamanhos e a haste destinatária.
    this.options={
        numOfPegs:3,
        qtdDiscos:3,
        container:"#game-container",
        discHeight:80,
        destinationPeg:3
    };
    //Se o numero de hastes for maior do que 5 ou menor que 0, receberá-se o valor default de 3.
    jQuery.extend(this.options,b);
    if(this.options.numOfPegs<0||this.options.numOfPegs>5){
        this.options.numOfPegs=3
    }
    //Se a haste destinatária for a menor que ou a primeira, ou maior do que o numero de hastes, define-se como a haste destinatária a ultima.
    if(this.options.destinationPeg<=1||this.options.destinationPeg>this.options.numOfPegs){
        this.options.destinationPeg=this.options.numOfPegs
    }
    //Inicia o jogo com os valores padrões
    this.state="init";
    this.result=0;
    this.steps=0;
    //Calcúlo do número máximo de jogadas necessárias para finalizar o jogo
    this.maxSteps=Math.pow(2,this.options.qtdDiscos)-1;
    this.pegs=[];
    this.container=jQuery(this.options.container);
    //Inicialização das funções que calculam os passos
    this.afterStep=this.options.afterStep||function(f){};
    this.afterInit=this.options.afterInit||function(f){};
    //Criação das hastes
    this.createPegs();
    //Criacão dos discos
    this.createDiscs(this.pegs[0]);
    //Inicio do jogo
    this.state="playing";
    this.afterInit(this)
};

//Função responsável pela criação das hastes
Game.prototype.createPegs=function(){
    //Criação unitária de cada uma das hastes
    for(var a=0;a<this.options.numOfPegs;a++){
        //Construção da haste e vinculamento ao container
        this.pegs[a]=new Haste(a);
        this.container.append(this.pegs[a].getPegContainer());
        //Definição da altura, deve ser no minimo a altura de cada disco multiplicado pelo número de discos
        this.pegs[a].getPeg().css({
            "min-height":this.options.discHeight*this.options.qtdDiscos
        });
        //Determina se um disco pode ser deixado ou não em determinada haste.
        this.turnPegDroppable(this.pegs[a])
    }
    //Determina a haste que será utilizada como a haste de destino final dos discos.
    this.pegs[this.options.destinationPeg-1].getPeg().parent().addClass("peg-destination")
};

// Criação dos discos
Game.prototype.createDiscs=function(peg){
    //Criação unitária de cada disco
    for(var e=0;e<this.options.qtdDiscos;e++){
        //Definição do visual dos discos
        var disco=new Disco({
            id:e+1,
            width:100+(e*75),
            height:this.options.discHeight,
            margin:(this.options.qtdDiscos-(e+(this.options.qtdDiscos-4)))*37.5,
            background:'url("../resources/styles/images/floor'+(e+1)+'.png")',
        });
        //Torna o disco arrastável quando no topo
        this.turnDiscDraggable(disco);
        //Adiciona o disco à haste
        peg.discs.push(disco);
        //Acrescenta o disco à haste
        peg.getPeg().append(disco.getDisc());
        //Determina a margem do topo, para que os discos não se sobreponham
        disco.getDisc().css("top",e*this.options.discHeight)
    }
    //Determina a altura de cada uma das pegs
    for(var e=1;e<this.options.numOfPegs;e++){
        this.pegs[e].getPeg().height(peg.getPeg().height())
    }
    //Torna o primeiro disco da peg arrastável
    peg.top().getDisc().draggable("option","disabled",false).addClass("moveable")
};
//Função responsável por tornar a peg disposta receber discos
Game.prototype.turnPegDroppable=function(f){
    var obj=this;
    var execute=function(i,d){
        var disc=d.draggable;
        var pegId=jQuery(this);
        pegId=obj.getPegById(pegId.attr("id"));
        //Checagem se uma haste possui um disco no topo, o que indicará se ela está vazia ou não
        var isPegEmpty=pegId.top()==null?true:false;
        //Recebe o valor do disco do topo, se houver, se não, null.
        var topDiscId=!isPegEmpty?pegId.top().getDisc().attr("id"):null;
        var topMargin;
        //A margem do topo será definida dependendo do número de discos que existir em cada haste
        if(!isPegEmpty){
            topMargin=pegId.getPeg().height()-(pegId.discs.length+1)*obj.options.discHeight
        }else{
            topMargin=(obj.options.qtdDiscos-1)*obj.options.discHeight
        }
        //Inicializa o disco como não arrastável, caso seja o do topo, se torna disponivel para arrastar
        disc.draggable("option","revert",false);
        if(!isPegEmpty&&topDiscId<=disc.attr("id")){
            disc.draggable("option","revert",true);
            return
        }
        //Transfere, remove de uma pilha, retorna seu valor e logo em seguida adiciona a outra
        pegId.push(obj.getPegByDiscId(disc.attr("id")).pop());
        //Empilha, se a haste estiver vazia adiciona no começo, se não ao fim
        if(!isPegEmpty){
            pegId.getPeg().prepend(disc);
            disc.css("top",topMargin)
        }else{
            pegId.getPeg().append(disc);
            disc.css("top",topMargin)
        }
        //Adiciona mais um passo efetuado pelo jogador
        obj.steps++;
        //Para cada Haste
        for(peg in obj.pegs){
            //Para cada disco
            for(d in obj.pegs[peg].discs){
                //Dessabilita a possibilidade de arrastar o disco
                obj.pegs[peg].discs[d].getDisc().draggable("option","disabled",true).removeClass("moveable")
            }
            //Se for o disco do topo, habilita a movimentação do mesmo
            if(obj.pegs[peg].top()!==null){
                obj.pegs[peg].top().getDisc().draggable("option","disabled",false).addClass("moveable")
            }
        }
        //Verifica se os passos acabaram e se o jogador acabou
        obj.afterStep(obj)
    };
    f.getPeg().droppable({
        hoverClass:"peg-over",
        drop:execute
    })
};

Game.prototype.turnDiscDraggable=function(a){
    //Altera as propriedades do disco para torná-lo arrastável
    a.getDisc().draggable({
        revert:"invalid",
        containment:this.container,
        cursor:"move",
        disabled:true,
        helper:"clone",
        opacity:0.35
    })
};

Game.prototype.getPegById=function(peg){
    //Caso a haste não exista retorna null
    if(!peg){
        return null
    }
    //Verifica se a haste desejada desejada existe
    var pegId=peg.substring(4)*1;
    for(var c=0;c<this.pegs.length;c++){
        if(this.pegs[c].id==pegId){
            return this.pegs[c]
        }
    }
    return null
};
//Retorna uma haste através do ID de um disco
Game.prototype.getPegByDiscId=function(f){
    var pegs=this.pegs;
    for(peg in pegs){
        var discs=pegs[peg].discs;
        for(disc in discs){
            if(f==discs[disc].getDisc().attr("id")){
                return pegs[peg]
            }
        }
    }
    return null
};
//Retorna os passos executados pelo jogador
Game.prototype.getSteps=function(){
    return this.steps
};
//Retorna o número máximo de passos
Game.prototype.getMaxSteps=function(){
    return this.maxSteps
};
// Define se o jogador venceu
Game.prototype.isWin=function(){
    //Se o jogo não estiver executando ele apenas retorna
    if(this.state!=="playing"){
        return
    }
    //Se o jogador já tiver executado o máximo possivel de passos e concluido o objetivo, ele vence, caso contrário, perde
    if(this.steps==this.getMaxSteps()){
        var destPeg=this.pegs[this.options.destinationPeg-1];
        if(destPeg.discs.length==this.options.qtdDiscos){
            return 1
        }
    }else{
        return 0
    }
};

// Função para reiniciar o jogo 
Game.prototype.restart=function(b){
    for(var c=0;c<this.options.numOfPegs;c++){
        var a=this.pegs[c];
        while(a.discs.length>0){
            a.pop()
        }
    }
    this.pegs=[];
    this.container.html("");
    b=b||{};
    jQuery.extend(this.options,b);
    this.createPegs();
    this.createDiscs(this.pegs[0]);
    this.maxSteps=Math.pow(2,this.options.qtdDiscos)-1;
    this.steps=0;
    this.result=0;
    this.state="playing"
};

// Função que trava movimentação ao fim do jogo
Game.prototype.freeze = function() {
    if (this.state == "freeze") {
        return
    }
    for (p in this.pegs) {
        for (d in this.pegs[p].discs) {
            var a = this.pegs[p].discs[d];
            a.getDisc().draggable("destroy").removeClass("moveable")
        }
        this.pegs[p].getPeg().droppable("destroy")
    }
    this.state = "freeze";
    this.onFreeze(this)
};