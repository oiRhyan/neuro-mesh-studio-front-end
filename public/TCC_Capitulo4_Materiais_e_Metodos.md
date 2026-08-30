**4 MATERIAIS E MÉTODOS**

**4.1 Contextualização do Desenvolvimento da Plataforma**

O desenvolvimento do NeuroMeshStudio foi concebido com o objetivo de criar uma plataforma web voltada à geração automatizada de modelos tridimensionais por meio de Inteligência Artificial generativa. A solução foi estruturada considerando princípios modernos de engenharia de software, buscando modularidade, escalabilidade, desacoplamento entre componentes e facilidade de manutenção.

Inicialmente, o processo de prototipação visual da plataforma foi realizado utilizando a ferramenta Figma, permitindo a construção iterativa das interfaces e a validação da experiência do usuário antes da implementação do sistema. Durante as fases iniciais de concepção, foram desenvolvidas pequenas versões experimentais das telas, com o objetivo de compreender padrões de navegação, hierarquia visual e organização dos elementos gráficos. Posteriormente, essas versões evoluíram para um layout próprio, minimalista e moderno, priorizando acessibilidade, fluidez visual e usabilidade.

A arquitetura do sistema foi baseada no modelo de três camadas (*Three-Layer Architecture*), dividido entre camada de apresentação, camada de negócio e camada de persistência. Essa abordagem permitiu separar responsabilidades entre o *Front-End* desenvolvido em Next.js, a API *Back-End* desenvolvida em .NET e a camada de dados responsável pelo armazenamento persistente das informações da plataforma. Além disso, o sistema adotou princípios de *Clean Architecture*, o padrão *Repository Pattern* e o padrão *Result Pattern*, visando desacoplar as regras de negócio da camada de infraestrutura e tornar explícito, em nível de tipo, o resultado de cada operação de domínio.

Dessa forma, serviços responsáveis por autenticação, geração de modelos, persistência de dados e comunicação com APIs externas puderam ser organizados de maneira independente, facilitando testes, manutenção e expansão futura da aplicação. A camada *Front-End* foi construída utilizando TypeScript e SCSS, permitindo tipagem estática, componentização reutilizável e estilização modular. Já o *Back-End* foi desenvolvido utilizando ASP.NET Core Web API com Entity Framework Core, empregando injeção de dependências, autenticação baseada em JWT (*JSON Web Token*), derivação criptográfica de senhas por função de *hash* com sal aleatório e integração com serviços externos especializados em geração tridimensional e armazenamento em nuvem.

A infraestrutura da aplicação foi hospedada na plataforma Microsoft Azure, utilizando separação entre os serviços da API e o banco de dados em diferentes clusters computacionais. Essa estratégia contribui para maior confiabilidade, isolamento de responsabilidades, escalabilidade horizontal e otimização do desempenho da aplicação.

Metodologicamente, este capítulo descreve o artefato construído em três níveis progressivos de detalhamento: (i) a decomposição arquitetural do sistema e os padrões estruturais que a sustentam (seção 4.2); (ii) o modelo de dados e sua materialização por mapeamento objeto-relacional (seção 4.3); e (iii) os fluxos de execução propriamente ditos — autenticação, geração tridimensional, *rigging* e persistência do ativo (seções 4.7 a 4.11) —, nos quais se explicita não apenas *como* cada interação ocorre, mas *por que* cada decisão de projeto foi tomada frente às restrições impostas pelo domínio: latência elevada e não determinística da inferência de IA, tráfego de arquivos binários volumosos e ausência de estado de sessão no servidor.

**4.2 Arquitetura Geral do Sistema**

A arquitetura do NeuroMeshStudio foi projetada para operar como uma aplicação distribuída baseada em serviços. Conforme ilustrado na Figura 10, o usuário interage inicialmente com a interface web, responsável pela comunicação com a API *Back-End*. Essa API centraliza regras de negócio, autenticação, controle de acesso, processamento das requisições e integração com serviços externos.

Figura 10 – Arquitetura de Solução do Sistema

A camada *Front-End* possui duas áreas principais:

* a *landing page* institucional, responsável por apresentar a proposta da plataforma, suas funcionalidades e direcionar visitantes para a autenticação;
* o ambiente autenticado da plataforma, denominado *Studio*, onde os usuários podem gerar, visualizar, configurar, salvar e exportar modelos tridimensionais.

A API desenvolvida em .NET atua como núcleo central do sistema, sendo responsável pelo gerenciamento de autenticação, controle de permissões, comunicação com o banco de dados, integração com a Tripo API, integração com o Cloudinary e com o serviço de armazenamento de objetos, processamento dos metadados dos modelos e gerenciamento do feed da comunidade.

Cabe destacar uma decisão arquitetural central: **a API não apenas encaminha requisições ao serviço de IA, mas atua como intermediária obrigatória (*proxy*) de todo o tráfego binário**. Nenhuma credencial do serviço de geração tridimensional é exposta ao navegador, e nenhum artefato gerado é consumido diretamente pelo cliente a partir do domínio do provedor externo. Essa mediação, detalhada na seção 4.9.4, resolve simultaneamente três problemas: o sigilo da chave de API, as restrições de política de mesma origem impostas pelos navegadores e a volatilidade das URLs assinadas emitidas pelo provedor.

**4.2.1 Decomposição Modular do Back-End**

A solução .NET foi segmentada em quatro projetos independentes, cuja direção de dependência é unidirecional e converge para o núcleo de domínio, conforme preconizado pela *Clean Architecture*:

* **Domain** — camada mais interna, sem qualquer dependência externa. Concentra as entidades (`User`, `UserProfile`, `ThreeDModel`), as abstrações estruturais (`Entity`, `Result<T>`, `IRepository<T>`) e os contratos de repositório (`IUserRepository`, `IThreeDModelRepository`). Por não referenciar bibliotecas de infraestrutura, o domínio permanece testável de forma isolada e imune a mudanças tecnológicas nas camadas externas.
* **Application** — camada de orquestração de casos de uso. Abriga os *handlers* (`UserCommandHandler`, `ThreeDModelHandler`, `GenerateModelHandler`), os objetos de comando e resposta de cada caso de uso, os contratos de integração com o serviço de IA e, sobretudo, **as interfaces dos serviços de infraestrutura** (`ITripoService`, `ICloudinaryService`, `ISupabaseService`, `IPasswordHashService`, `ITokenManager`). O fato de as interfaces residirem na camada de aplicação, e não junto às implementações, materializa o Princípio da Inversão de Dependência: a política de negócio define o contrato, e o detalhe técnico se adapta a ele.
* **Infrastructure** — implementa os contratos definidos nas camadas internas: o `DbContext` do Entity Framework Core, os repositórios concretos e os adaptadores para os serviços externos. É a única camada que conhece SQL Server, HTTP, Cloudinary ou o provedor de armazenamento de objetos.
* **API** — camada de borda. Contém os *controllers*, os *forms* de entrada (DTOs acoplados ao protocolo HTTP, com tipos como `IFormFile`), a configuração de *middleware*, as políticas de CORS, os parâmetros de validação de token e as *migrations* do banco de dados.

Um aspecto metodologicamente relevante dessa separação é a **conversão deliberada de tipos na fronteira da API**. Os *controllers* recebem arquivos como `IFormFile` — abstração pertencente ao ASP.NET Core — e os convertem em `Stream` antes de construir o objeto de comando repassado à camada de aplicação, conforme ilustrado no Quadro 1. Assim, a camada de aplicação permanece agnóstica quanto ao protocolo de transporte: o mesmo caso de uso poderia ser acionado por uma interface de linha de comando, por uma fila de mensagens ou por testes automatizados, sem qualquer alteração.

Quadro 1 – Conversão de DTO de transporte em comando de aplicação

```csharp
[HttpPost]
[Consumes("multipart/form-data")]
public async Task<IActionResult> CreateAsyncUser([FromForm] CreateUserRequestForm form)
{
    var command = new CreateUserCommand(
        form.Name, form.Email, form.Password,
        form.ImageProfile.OpenReadStream(),   // IFormFile -> Stream
        form.ImageBanner?.OpenReadStream(),
        form.Biography);

    var request = await _handler.CreateAsyncUser(command);

    return request.Success
        ? Ok(request.Value)
        : BadRequest(new { error = request.Message });
}
```

Fonte: Elaborado pelos autores (2026).

A organização interna da camada de aplicação segue o modelo de **fatias verticais** (*vertical slices*): cada caso de uso possui um diretório próprio contendo seu comando de entrada e seu objeto de resposta (por exemplo, `CreateAsyncUser/CreateUserCommand` e `CreateAsyncUser/CreateUserResult`). Essa organização por funcionalidade — em oposição à organização por tipo técnico — reduz o acoplamento entre casos de uso e permite que a evolução de um fluxo não implique alterações nos demais.

**4.2.2 Repository Pattern**

O *Repository Pattern* foi adotado para isolar as regras de negócio dos detalhes de persistência. Sua aplicação no projeto segue três diretrizes:

a) **Contratos no domínio, implementações na infraestrutura.** As interfaces `IUserRepository` e `IThreeDModelRepository` são declaradas no projeto *Domain* e derivam de uma abstração genérica marcadora `IRepository<T> where T : Entity`, que restringe o padrão às entidades que possuem identidade. As implementações concretas residem no projeto *Infrastructure* e recebem o `DbContext` por injeção de dependência via construtor primário.

b) **Semântica de domínio nas assinaturas.** Os métodos expostos não replicam a API genérica do ORM, mas expressam intenções de negócio — `GetUserByEmail`, `GetModelsFromUserId`, `GetAllPublicModels`, `RegisterNewModel`. Como consequência, a linguagem de consulta (LINQ) e as estratégias de carregamento ansioso (`Include`/`ThenInclude`) permanecem confinadas à infraestrutura, e os *handlers* de aplicação não conhecem o modelo relacional.

c) **Unidade de trabalho implícita.** Não foi implementado um *Unit of Work* explícito, uma vez que o próprio `DbContext`, registrado com tempo de vida por requisição, já cumpre essa função: ele mantém o rastreamento de alterações (*change tracking*) das entidades materializadas e consolida as mudanças em uma única transação ao término da operação. Isso explica, por exemplo, o comportamento do método de atualização de perfil, no qual a mutação é aplicada ao objeto de domínio em memória e o repositório apenas efetiva a persistência.

**4.2.3 Result Pattern**

Um dos problemas recorrentes em aplicações em camadas é o uso de exceções como mecanismo de controle de fluxo para falhas previsíveis de negócio — credenciais inválidas, registro inexistente, violação de regra. Além do custo computacional associado ao desenrolamento da pilha, essa prática torna implícito, na assinatura dos métodos, aquilo que deveria ser explícito: a possibilidade de falha.

Para mitigar esse problema, adotou-se o *Result Pattern*, materializado pelo tipo genérico `Result<T>` (Quadro 2). Todo *handler* de caso de uso retorna `Task<Result<T>>`, de modo que a falha passa a ser um valor de retorno legítimo e tipado, e não um desvio excepcional de execução.

Quadro 2 – Implementação do tipo `Result<T>`

```csharp
public class Result<T>
{
    public T Value { get; set; }
    public bool Success => Value != null;
    public string Message { get; private set; }

    public static Result<T> onSuccess(T value) => new(value, null);
    public static Result<T> onError(string message) => new(default, message);
}
```

Fonte: Elaborado pelos autores (2026).

A consequência arquitetural desse padrão é a delimitação clara de responsabilidades na tradução semântica dos erros: a camada de aplicação decide **se** a operação foi bem-sucedida e **qual** a razão da falha, enquanto a camada de API decide **como** essa falha é representada no protocolo HTTP. Todos os *controllers* implementam a mesma regra de tradução: `Result.Success` verdadeiro resulta em resposta `200 OK` com o valor encapsulado; falso resulta em `400 Bad Request` com um objeto contendo a mensagem descritiva. Essa uniformidade simplifica o tratamento de erros no cliente, que precisa interpretar um único formato de resposta de erro (`{ "error": "..." }`), independentemente do endpoint acionado.

Registra-se, como limitação metodológica desta implementação, que a propriedade `Success` é inferida da nulidade de `Value`, e não de um discriminador explícito de estado; e que as falhas são representadas exclusivamente por mensagens textuais, sem código de erro tipado. Disso decorre que a API responde `400 Bad Request` também em situações cuja semântica correta seria `401 Unauthorized`, `404 Not Found` ou `409 Conflict`. Trata-se de um ponto identificado para evolução futura, discutido na seção 4.12.

**4.2.4 Organização da Camada de Apresentação**

O *Front-End* replica, em escala proporcional, a mesma lógica de separação de responsabilidades adotada no servidor, distribuindo-se em quatro estratos:

* **Cliente HTTP (`core`)** — uma única instância de `axios` (`tripoApi`) concentra a URL base da API e o tempo limite das requisições. Um interceptador registrado nessa instância recupera o token de acesso do repositório de *cookies* e o injeta no cabeçalho `Authorization` de toda requisição de saída (Quadro 3). A centralização desse comportamento em um único ponto elimina a repetição da lógica de autenticação nos módulos de serviço e garante que nenhum endpoint protegido seja acionado sem credencial.
* **Serviços (`services`)** — funções assíncronas puras que encapsulam a chamada HTTP e a montagem do corpo da requisição (JSON ou `FormData`), sem qualquer estado de interface. Correspondem, em nível de cliente, ao contrato público da API.
* **Hooks** — camada de estado e orquestração, detalhada na seção 4.10 e implementada tanto por *hooks* próprios (`useAuthorization`, `useGenerateModel`) quanto pelos *hooks* de gerenciamento de estado assíncrono da biblioteca TanStack Query (`useQuery`, `useMutation`).
* **Componentes** — responsáveis exclusivamente pela composição visual e pela captura de eventos do usuário, delegando toda a lógica de comunicação aos estratos anteriores.

Quadro 3 – Interceptador de autenticação do cliente HTTP

```typescript
export const tripoApi = axios.create({
  baseURL: "https://<host-da-api>/api",
  timeout: 20000,
});

tripoApi.interceptors.request.use((config) => {
  const token = Cookies.get("access-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Fonte: Elaborado pelos autores (2026).

**4.2.5 Contrato de Comunicação e Política de Origem Cruzada**

A comunicação entre *Front-End* e *Back-End* ocorre por meio de requisições HTTP sobre arquitetura REST, com dois formatos de carga útil distintos, selecionados conforme a natureza do dado transportado: `application/json` para operações que trafegam exclusivamente dados estruturados (autenticação, disparo de *rigging*, exclusão de modelo) e `multipart/form-data` para operações que envolvem transferência de arquivos binários (cadastro com imagem de perfil, submissão da imagem de referência, salvamento de modelo com miniatura).

Como cliente e servidor residem em domínios distintos — a interface hospedada na plataforma de *edge* e a API no cluster de aplicação da nuvem —, toda requisição do navegador é caracterizada como de origem cruzada. Configurou-se, portanto, uma política nomeada de CORS que declara explicitamente as origens confiáveis (o domínio de produção da interface e o endereço de desenvolvimento local), autoriza os métodos e cabeçalhos utilizados e, adicionalmente, expõe o cabeçalho `Content-Disposition`. Essa última diretiva é o que viabiliza que o navegador acesse, por meio de código JavaScript, os metadados de nome de arquivo retornados pelo endpoint de download do modelo tridimensional — informação que, por padrão, permanece inacessível ao cliente em respostas de origem cruzada. Trata-se de exemplo ilustrativo de como restrições do modelo de segurança do navegador impuseram decisões concretas de configuração no servidor.

**4.3 Modelagem do Banco de Dados**

A modelagem do banco de dados foi estruturada considerando os requisitos funcionais da plataforma, especialmente autenticação de usuários, gerenciamento de perfis, armazenamento das referências aos modelos tridimensionais e integração com as funcionalidades da comunidade. A especificação da camada de persistência desempenha papel crítico na sustentação dos requisitos não funcionais do sistema, tais como consistência, integridade referencial e segurança da informação.

A materialização do modelo conceitual em esquema relacional foi realizada por meio do Entity Framework Core, adotando-se a abordagem *Code First*: as entidades são definidas em código C#, o mapeamento é declarado de forma imperativa na API fluente do `DbContext` e o esquema físico é derivado a partir dessas definições por meio de *migrations* versionadas. Essa abordagem foi escolhida por manter o modelo de domínio como fonte única de verdade e por permitir que a evolução do esquema seja rastreada no mesmo repositório de código da aplicação.

**4.3.1 Abstração de Entidade e Estratégia de Geração de Identidade**

Todas as entidades persistidas derivam de uma classe abstrata comum, `Entity`, que define dois atributos transversais: um identificador do tipo `Guid`, decorado como chave primária, e um carimbo temporal de criação em UTC. Ambos são inicializados no próprio construtor da classe base, com propriedades declaradas como `init` — isto é, imutáveis após a construção do objeto.

Essa decisão possui uma implicação técnica relevante e deliberada: **a identidade é gerada pela aplicação, e não pelo Sistema Gerenciador de Banco de Dados**. Em oposição ao uso de colunas autoincrementais, o emprego de identificadores universalmente únicos gerados em memória permite que a entidade possua identidade completa antes mesmo de ser submetida à persistência, o que é particularmente conveniente em fluxos assíncronos e em operações que compõem múltiplos serviços externos antes da gravação final. Adicionalmente, identificadores não sequenciais não revelam volumetria nem ordem de cadastro quando expostos em URLs, mitigando enumeração de recursos.

**4.3.2 Entidade Users e o Perfil como Tipo Possuído**

A entidade `User` concentra as credenciais de acesso — endereço de correio eletrônico e o resumo criptográfico da senha — e mantém duas associações: uma composição com o perfil do usuário e uma coleção de modelos tridimensionais de sua autoria.

O perfil (`UserProfile`), que armazena nome de exibição, imagem de avatar, imagem de banner e biografia, foi modelado como **tipo possuído** (*owned entity type*), e não como entidade independente. A distinção é conceitualmente significativa: um tipo possuído não possui identidade própria nem existência autônoma, sendo conceitualmente parte indivisível do agregado `User`. No plano físico, o Entity Framework Core achata os atributos do perfil como colunas adicionais da própria tabela `Users`, com chave primária compartilhada. A consequência prática é que a recuperação do usuário e de seu perfil ocorre em uma única operação de leitura, sem junção relacional — decisão que privilegia o desempenho de leitura, dado que, em todos os fluxos da plataforma, o perfil é invariavelmente consumido junto ao usuário.

O encapsulamento do estado é reforçado pelo próprio modelo de domínio: as propriedades possuem modificadores de escrita privados e a mutação ocorre exclusivamente por métodos de comportamento. O método `UpdateProfile` implementa semântica de atualização parcial, sobrescrevendo apenas os campos cujo novo valor não seja nulo ou vazio (Quadro 4). É essa característica do domínio — e não uma verificação na camada de API — que fundamenta a exposição do endpoint de atualização de perfil sob o verbo HTTP `PATCH`, coerentemente com a semântica de modificação parcial de recurso.

Quadro 4 – Atualização parcial encapsulada no modelo de domínio

```csharp
public void UpdateProfile(string? userName, string? profileImage,
                          string? bannerImage, string? biography)
{
    if (!string.IsNullOrWhiteSpace(userName))     this.UserName = userName;
    if (!string.IsNullOrWhiteSpace(profileImage)) this.ProfileImage = profileImage;
    if (!string.IsNullOrWhiteSpace(bannerImage))  this.BannerImage = bannerImage;
    if (!string.IsNullOrWhiteSpace(biography))    this.Biography = biography;
}
```

Fonte: Elaborado pelos autores (2026).

**4.3.3 Entidade ThreeDModels e a Estratégia de Persistência por Referência**

A entidade `ThreeDModel` registra os metadados de cada artefato tridimensional: título, descrição, endereço da miniatura, endereço do arquivo de malha com texturização PBR, o indicador booleano de visibilidade pública e a chave estrangeira para o usuário autor.

A decisão de projeto mais determinante nesta entidade é a **persistência por referência, e não por valor**: nenhum conteúdo binário é gravado no banco relacional. Tanto a miniatura quanto o arquivo `.glb` são armazenados em serviços especializados — respectivamente, a plataforma de mídia e o serviço de armazenamento de objetos —, e o banco de dados retém unicamente as URLs públicas resultantes, tipadas como cadeias de caracteres de comprimento variável. Três justificativas sustentam essa escolha: (i) arquivos de malha texturizada frequentemente excedem a dezena de megabytes, e seu armazenamento em colunas binárias degradaria significativamente o desempenho de consulta e o custo de backup do banco; (ii) a entrega de conteúdo estático a partir de redes de distribuição especializadas apresenta latência substancialmente inferior à intermediação pelo servidor de aplicação; e (iii) a separação preserva o banco relacional para aquilo que efetivamente lhe compete — a garantia de integridade referencial entre autor e artefato. Registra-se que a miniatura foi originalmente modelada como dado binário e posteriormente convertida para referência textual, alteração formalizada em *migration* específica, conforme descrito na seção 4.3.5.

O relacionamento entre usuário e modelos foi configurado explicitamente na API fluente do contexto como uma associação de um para muitos, com chave estrangeira obrigatória e comportamento de exclusão em cascata (Quadro 5). A obrigatoriedade da associação impede a existência de artefatos órfãos, e a cascata garante que a remoção de um usuário elimine consistentemente seus registros dependentes. Complementarmente, a propriedade de navegação inversa (`ThreeDModel.User`) foi anotada para ser ignorada na serialização, prevenindo o ciclo de referência que ocorreria ao serializar um modelo que referencia seu usuário, o qual, por sua vez, referencia sua coleção de modelos.

Quadro 5 – Configuração do mapeamento objeto-relacional

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<User>().OwnsOne(x => x.Profile);

    modelBuilder.Entity<User>()
        .HasMany(x => x.ThreeDModels)
        .WithOne(x => x.User)
        .HasForeignKey(x => x.UserId);

    base.OnModelCreating(modelBuilder);
}
```

Fonte: Elaborado pelos autores (2026).

O Quadro 6 sintetiza o esquema físico derivado desse mapeamento, cujo detalhamento gráfico consta da Figura 11.

Quadro 6 – Esquema físico gerado pelas *migrations*

| Tabela | Coluna | Tipo (SQL Server) | Observações |
| :---- | :---- | :---- | :---- |
| Users | Id | uniqueidentifier | Chave primária, gerada pela aplicação |
| Users | CreatedAt | datetime2 | Carimbo temporal em UTC |
| Users | UserEmail | nvarchar(max) | Obrigatório; identificador de autenticação |
| Users | PasswordHash | nvarchar(max) | Resumo criptográfico com sal embutido |
| Users | Profile_UserName | nvarchar(max) | Tipo possuído, achatado na tabela |
| Users | Profile_ProfileImage | nvarchar(max) | URL do avatar |
| Users | Profile_BannerImage | nvarchar(max) | URL do banner |
| Users | Profile_Biography | nvarchar(max) | Texto descritivo |
| ThreeDModels | Id | uniqueidentifier | Chave primária |
| ThreeDModels | CreatedAt | datetime2 | Base de ordenação cronológica |
| ThreeDModels | ModelTitle / ModelDescription | nvarchar(max) | Metadados descritivos |
| ThreeDModels | ModelThumbnail | nvarchar(max) | URL da miniatura |
| ThreeDModels | PbrModel | nvarchar(max) | URL do arquivo .glb texturizado |
| ThreeDModels | Public | bit | Governa a visibilidade no feed |
| ThreeDModels | UserId | uniqueidentifier | Chave estrangeira indexada, exclusão em cascata |

Fonte: Elaborado pelos autores (2026).

Figura 11 – Modelagem Relacional de Banco de Dados

**4.3.4 Governança do Acesso Comunitário**

O caráter colaborativo da plataforma é governado por um único atributo do agregado de modelo: o indicador booleano `Public`, cujo valor padrão é falso. A mutação desse estado não é livre — ocorre exclusivamente por meio do método de comportamento `setModelInPublic`, invocado pelo *handler* de registro a partir da opção selecionada pelo usuário no momento do salvamento. O padrão restritivo (*private by default*) foi adotado deliberadamente: um artefato só se torna visível à comunidade mediante ação afirmativa e explícita de seu autor.

A consulta que alimenta o feed comunitário aplica o filtro de visibilidade diretamente na expressão traduzida para SQL, evitando a materialização de registros privados em memória, e realiza carregamento ansioso encadeado do autor e de seu perfil possuído (Quadro 7). Esse carregamento é necessário porque o cartão exibido na *Home* apresenta, além do artefato, a autoria — nome de exibição e avatar do criador.

Quadro 7 – Consulta do feed da comunidade

```csharp
return await context.ThreeDModels
                    .Include(x => x.User)
                    .ThenInclude(x => x.Profile)
                    .Where(x => x.Public.Equals(true))
                    .ToListAsync();
```

Fonte: Elaborado pelos autores (2026).

Um cuidado adicional foi observado no transporte desses dados: o *handler* não serializa a entidade de domínio diretamente, mas a projeta em um contrato de saída específico, composto pelos metadados do artefato e por um objeto reduzido de autoria contendo apenas nome, avatar, banner e biografia. Essa projeção constitui a barreira que impede o vazamento de atributos sensíveis — notadamente o endereço de correio eletrônico e o resumo criptográfico da senha — que, de outro modo, seriam expostos ao serializar o agregado completo. Trata-se da aplicação prática do princípio de mínima exposição de dados na fronteira da aplicação.

**4.3.5 Versionamento Evolutivo do Esquema**

A evolução do esquema foi conduzida por quatro *migrations* sequenciais, geradas no assembly da API e aplicadas ao cluster de banco de dados: a criação inicial das tabelas de identidade e perfil; a introdução da entidade de modelos tridimensionais e de sua associação com o usuário; a conversão do tipo de armazenamento da malha, de conteúdo binário para referência textual; e, por fim, a conversão análoga aplicada à miniatura. As duas últimas *migrations* documentam empiricamente a transição da estratégia de persistência descrita na seção 4.3.3 — evidência de que a decisão por armazenar referências, e não binários, decorreu da observação prática das limitações da abordagem inicial durante o desenvolvimento.

**4.4 Modelo de Casos de Uso**

Os casos de uso do NeuroMeshStudio foram definidos com o objetivo de representar as principais interações entre usuários e sistema, conforme detalhado na Figura 12.

Figura 12 – Representação dos Casos de Uso

O sistema contempla dois atores principais: o Visitante e o Usuário Autenticado. O visitante possui acesso apenas às funcionalidades institucionais da plataforma, ao cadastro e ao processo de autenticação. Após realizar login, o usuário passa a ter acesso às funcionalidades do ambiente principal da aplicação. Entre os principais casos de uso destacam-se o cadastro e a autenticação de usuários, a configuração dos parâmetros de geração, a geração e a interação com modelos tridimensionais, a exportação e o salvamento de modelos e o consumo do feed da comunidade.

Cada caso de uso corresponde a um ou mais pontos de extremidade da API REST. O Quadro 8 apresenta esse mapeamento, explicitando os requisitos de autenticação de cada operação e servindo de referência para as seções subsequentes, que descrevem os fluxos em detalhe.

Quadro 8 – Mapeamento entre casos de uso e pontos de extremidade da API

| Método | Rota | Autenticação | Caso de uso associado |
| :---- | :---- | :---- | :---- |
| POST | /api/User | Pública | Cadastro de usuário |
| POST | /api/User/auth | Pública | Autenticação e emissão de token |
| GET | /api/User/{userId} | JWT | Consulta de perfil |
| PATCH | /api/User/update/{userId} | JWT | Atualização parcial de perfil |
| POST | /api/Tripo | JWT | Disparo da geração tridimensional |
| GET | /api/Tripo/status | JWT | Monitoramento assíncrono da tarefa |
| GET | /api/Tripo/download | Pública | Intermediação do arquivo de malha |
| POST | /api/Tripo/models/checking | JWT | Verificação de aptidão ao *rigging* |
| POST | /api/Tripo/models/rig | JWT | Execução do *rigging* |
| POST | /api/Tripo/models/animation | JWT | Aplicação de animações predefinidas |
| POST | /api/Tripo/save | JWT | Persistência do artefato gerado |
| GET | /api/Tripo/models | JWT | Listagem dos modelos do usuário |
| DELETE | /api/Tripo | JWT | Exclusão de modelo e de seus binários |
| GET | /api/Tripo/models/public | JWT | Consumo do feed da comunidade |

Fonte: Elaborado pelos autores (2026).

Observa-se que o consumo do feed da comunidade exige autenticação, de modo que a dimensão colaborativa da plataforma constitui benefício exclusivo de usuários registrados — decisão coerente com o modelo de casos de uso, no qual o ator Visitante possui acesso restrito ao conteúdo institucional.

**4.5 Protótipos de Interface e Experiência do Usuário**

O processo de design de interface do NeuroMeshStudio foi desenvolvido sob o amparo de metodologias de Design Centrado no Usuário (DCU), buscando consolidar uma experiência visual moderna, intuitiva e imersiva. A identidade visual da plataforma foi construída com foco em minimalismo, alto contraste visual e organização hierárquica das informações, mitigando a carga cognitiva comumente associada a softwares de modelagem tridimensional convencionais.

Para alcançar a imersão necessária ao manuseio de malhas 3D, adotou-se uma estética baseada em Dark Mode predominante — apelidada de Cosmic Tech UI —, utilizando o efeito de Glassmorphism (componentes translúcidos com desfoque de fundo) para conferir profundidade espacial. O contraste é estabelecido por uma paleta de cores escuras para o plano de fundo, superfícies em tons de cinza grafite e acentos cromáticos em azul neon e ciano, que guiaram os pontos de interatividade do usuário e delimitaram a hierarquia visual.

**4.5.1 Landing Page**

A Landing Page foi projetada para funcionar como a porta de entrada pública e não autenticada da plataforma, atuando como o primeiro nível do funil de conversão de usuários. O objetivo principal desta interface é puramente informativo e de contextualização: ela apresenta dados sobre o projeto, as capacidades de inteligência artificial generativa embarcadas e os objetivos acadêmicos e práticos da aplicação.

A arquitetura de informação desta página foi dividida em seções lógicas de leitura em padrão Z-pattern (relevante para páginas com foco em conversão e escaneabilidade rápida). O topo é composto por uma seção Hero impactante, contendo uma chamada textual clara (Value Proposition) e um botão de Ação (Call to Action \- CTA) proeminente que redireciona o visitante para o fluxo de login. Abaixo, cartões modulares e limpos decompõem as funcionalidades (geração a partir de imagem única, texto ou múltiplas visões) conforme mostrado na Figura 13\. Essa abordagem estrutural permite que visitantes e avaliadores compreendam rapidamente a proposta de valor do NeuroMeshStudio antes de iniciar o processo de autenticação e criação de sessões.

Figura 13 – Landing Page Inicial (Conceito Alpha e Final)

![][image12]

**4.5.2 Tela de Autenticação**

A tela de autenticação representa a ponte de transição entre o conteúdo institucional público e o ecossistema privado da aplicação. Ela foi desenvolvida priorizando uma rigidez geométrica, simplicidade visual e clareza absoluta na interação, seguindo a Heurística de Nielsen de "Prevenção de Erros".

O layout adota uma divisão de tela limpa ou um card centralizado de alto contraste contra o fundo escuro da aplicação. Nela, os formulários para que os usuários realizem o cadastro e o login foram unificados ou dispostos de maneira simétrica, mitigando ruídos visuais. Os campos de entrada de dados (inputs) para e-mail e senha possuem estados visuais bem delimitados para foco (focus), preenchimento correto (success) e incorreto (error), oferecendo feedback instantâneo ao usuário. O botão de submissão herda a cor de destaque principal do sistema, deixando evidente a ação necessária para obter o token JWT que concede acesso ao ambiente principal da aplicação, aprensentado na Figura 14\. 

Figura 14 – Tela de Login (Conceito Alpha e Final)

![][image13]

**4.5.3 Home e Studio de Criação**

A área logada da aplicação subdivide-se em dois macroambientes complementares que compartilham do mesmo design system, mantendo a consistência visual global:

A Home principal da plataforma foi concebida como um ambiente híbrido entre um dashboard operacional de controle de projetos e uma comunidade criativa. O layout organiza as informações através de uma malha flexível (Grid System), dividida em três seções críticas de consumo:

* Um painel superior ou lateral dedicado a novidades e atualizações técnicas da plataforma;  
* Uma seção de acesso rápido que exibe as criações recentes do próprio usuário (permitindo que ele recupere o estado de seu último modelo salvo no banco de dados com um único clique para dar continuidade ao trabalho);  
* Um feed dinâmico que consome os modelos tridimensionais que outros membros da comunidade decidiram tornar públicos.

O Studio de criação representa o núcleo funcional e a área de maior densidade computacional da aplicação. Ele foi estruturado para atuar como uma área de trabalho imersiva, inspirada em softwares de engenharia e modelagem, mas simplificada para o ambiente web conforme mostrado na Figura 15\. A tela é dominada por um viewport/canvas central limpo, onde o modelo 3D é renderizado em tempo real utilizando a tecnologia WebGL por meio do Three.js.

Flutuando sobre essa área de visualização, sem obstruir o campo de visão do objeto, encontram-se as barras de ferramentas modulares e os painéis de configuração. O painel esquerdo concentra o fluxo de entrada, permitindo o anexo de mídias de referência. O painel direito encapsula os controles de parametrização da Tripo API (como seleção do motor P1 ou v3.1, limites de faces e controle de topologia) e os controladores locais de ambiente, permitindo ao usuário manipular a intensidade de luzes orbitais e a projeção de sombras diretamente no cenário. Por fim, a barra de controle de saída disponibiliza os botões para salvar o projeto no banco relacional, definir seu estado de privacidade (público/privado) e exportar o arquivo final no formato .glb.

Figura 15 – Tela de Studio e Home da Plataforma

![][image14]

**4.6 Tecnologias Utilizadas**

           O **NeuroMeshStudio** utiliza um conjunto integrado de tecnologias modernas e de alta performance voltadas ao desenvolvimento web de página única (*Single Page Application \- SPA*), computação em nuvem distribuída e Inteligência Artificial generativa aplicada à reconstrução tridimensional. A escolha das ferramentas pautou-se em critérios de interoperabilidade, manutenibilidade do código e eficiência de rede para o tráfego de arquivos volumosos (mídias bidimensionais e malhas 3D).

**4.6.1 Ecossistema de Front-End: Next.js, TypeScript e SCSS**

O desenvolvimento da camada de apresentação e interface com o cliente foi inteiramente baseado no framework Next.js, utilizando o motor de renderização híbrida da biblioteca React.

Next.js e Renderização Híbrida: O Next.js foi selecionado por sua capacidade de orquestrar renderizações flexíveis. Enquanto a Landing Page institucional se beneficia da renderização estática (Static Site Generation \- SSG), otimizando o carregamento inicial, o tempo de resposta e a indexação em motores de busca (SEO), os módulos privados do Dashboard e do Studio operam sob renderização no lado do cliente (Client-Side Rendering \- CSR), garantindo a reatividade em tempo real necessária para a manipulação do canvas 3D.

TypeScript: A linguagem TypeScript foi integrada para adicionar tipagem estática ao ecossistema JavaScript. Em um ambiente complexo como o Studio, que lida com estruturas de dados mutáveis oriundas de APIs de IA e parâmetros estritos de matrizes tridimensionais, o TypeScript atua mitigando erros em tempo de compilação, aplicando checagem de tipos estrita e fornecendo maior legibilidade e segurança na refatoração do código.

SCSS (Sassy CSS): A estilização das interfaces baseou-se em SCSS devido à sua compatibilidade nativa com a arquitetura de componentes do Next.js. A utilização de pré-processadores permitiu a implementação de uma arquitetura modular de CSS (CSS Modules), o uso de variáveis globais para a paleta de cores do Dark Mode, o aninhamento de seletores e a criação de mixins reutilizáveis. Isso garantiu a manutenibilidade do layout e evitou o vazamento de escopo de estilos entre as diferentes telas da aplicação.

**4.6.2 Engenharia de Back-End: .NET e ASP.NET Web API**

No núcleo de persistência lógica e processamento de regras de negócio, utilizou-se a plataforma .NET, configurada especificamente para o desenvolvimento de uma API RESTful de alta concorrência.

ASP.NET Core Web API: O ASP.NET Core fornece um runtime otimizado e modular para a construção de microsserviços e APIs escaláveis. O ecossistema foi projetado utilizando os princípios de Clean Architecture e Repository Pattern, isolando o domínio das dependências externas.

Injeção de Dependências (DI): A API se beneficia do contêiner de injeção de dependências nativo do .NET, o que simplifica o desacoplamento de componentes, melhora a testabilidade de software e gerência de forma limpa o ciclo de vida dos serviços de persistência e comunicação (como instâncias de contextos do Entity Framework Core e clientes HTTP).

Segurança e Autenticação JWT: A segurança no tráfego das requisições é mediada pelo middleware de autenticação baseado em JSON Web Tokens (JWT). Após a validação das credenciais criptografadas por algoritmos de hashing, a API emite um token assinado digitalmente. Este token é inspecionado a cada nova requisição aos endpoints protegidos, validando a identidade do usuário de forma totalmente stateless (sem estado no servidor).

**4.6.3 Plataforma de Armazenamento de Mídia: Cloudinary**

O armazenamento, otimização e distribuição de mídias estáticas — como as imagens enviadas pelos usuários e as miniaturas geradas para os modelos — ocorre por meio da integração com a plataforma Cloudinary.

Desoneração do Servidor: Em vez de trafegar e persistir arquivos binários pesados diretamente no servidor de aplicação ou no banco de dados, o front-end submete a imagem à API .NET, que por sua vez realiza o upload para os servidores de CDN (Content Delivery Network) do Cloudinary. O serviço processa a imagem, otimiza seu tamanho e formato automaticamente para entrega web, e devolve uma URL otimizada e de alta disponibilidade. Essa URL é usada pela API .NET tanto para alimentar os algoritmos de geração 3D quanto para persistir a referência textual no banco de dados SQL Server.

**4.6.4 Processamento de Geometria 3D: Tripo API**

A inteligência gerativa responsável pela conversão automatizada de arquivos e descrições bidimensionais em malhas vetoriais tridimensionais complexas é alimentada pela Tripo API.

Processamento Assíncrono via IA: A integração ocorre via requisições REST síncronas para o disparo de tarefas e mecanismos assíncronos baseados em polling para o acompanhamento do status do processamento. A API da Tripo orquestra algoritmos profundos de reconstrução geométrica em servidores de alta capacidade (GPUs), gerando arquivos em formatos consolidados de mercado (como .glb e .fbx) a partir de modelos como o P1-20260311 ou a versão v3.1-20260211, que entregam malhas otimizadas com topologia limpa, texturização PBR (Physics-Based Rendering) e limites poligonais controláveis diretamente pelo painel do Studio.

**4.6.5 Infraestrutura de Nuvem: Microsoft Azure**

Toda a infraestrutura computacional, de rede e de persistência do NeuroMeshStudio está provisionada e hospedada na plataforma de nuvem Microsoft Azure.

Arquitetura Distribuída em Nuvem: Buscando atender a padrões rígidos de tolerância a falhas e isolamento de recursos, a arquitetura foi desenhada de forma segregada: a API .NET fica alocada e rodando dentro de um cluster computacional escalável, enquanto o banco de dados relacional SQL Server reside em um cluster de banco de dados isolado e gerenciado. Esta separação física e lógica impede que picos de requisições ou vazamentos de memória na camada de aplicação afetem a integridade e a disponibilidade dos dados estruturados da plataforma, permitindo políticas de balanceamento de carga e escalabilidade vertical ou horizontal independentes para cada componente do sistema.

Acrescenta-se, à caracterização tecnológica já apresentada, o registro do conjunto de bibliotecas complementares que sustentam os fluxos descritos nas seções seguintes. No cliente, empregaram-se o TanStack Query para o gerenciamento do estado assíncrono e do cache de servidor; a biblioteca React Hook Form em conjunto com o validador de esquemas Zod, que estabelece validação declarativa com inferência estática de tipos; e o par `js-cookie` e `jwt-decode` para a manipulação da sessão. A renderização tridimensional apoia-se no React Three Fiber e no conjunto de auxiliares Drei, camadas declarativas construídas sobre a biblioteca Three.js. No servidor, além do Entity Framework Core, utilizaram-se o componente de *hashing* de senhas do ASP.NET Core Identity, o *middleware* de autenticação JWT Bearer e clientes tipados de `HttpClient` para a integração com serviços externos.

**4.7 Fluxo de Cadastro e Autenticação de Usuários**

A autenticação constitui o pré-requisito de acesso a praticamente todos os recursos da plataforma. Seu fluxo foi projetado sob o paradigma *stateless*, no qual o servidor não mantém registro de sessões ativas — decisão diretamente relacionada ao requisito não funcional de escalabilidade horizontal, pois permite que qualquer instância da API atenda qualquer requisição sem necessidade de afinidade de sessão ou de armazenamento compartilhado de estado.

**4.7.1 Cadastro do Usuário**

O cadastro inicia-se na tela de autenticação, onde o formulário é validado no cliente por um esquema declarativo que estabelece as restrições de nome, formato de endereço eletrônico, comprimento mínimo de senha, presença de imagem de perfil e faixa de comprimento da biografia. A validação prévia no cliente cumpre função de usabilidade — feedback imediato e prevenção de erros —, mas não substitui as verificações do servidor, que permanecem como fronteira efetiva de confiança.

Aprovada a validação, o serviço de cliente monta um corpo `multipart/form-data`, necessário porque a requisição transporta simultaneamente campos textuais e um arquivo de imagem, e o submete ao ponto de extremidade de criação de usuário. A operação é encapsulada por uma mutação do TanStack Query, cujos manipuladores de sucesso e erro controlam a notificação ao usuário e a transição da interface de volta ao formulário de login.

No servidor, o *handler* de aplicação executa a seguinte sequência determinística:

1. **Externalização da imagem.** O fluxo binário da imagem de perfil é submetido à plataforma de mídia, que devolve a URL segura do recurso otimizado. A ausência de URL interrompe o fluxo, pois a imagem de perfil é requisito obrigatório do agregado.
2. **Construção do agregado.** Instancia-se a entidade `User` com o endereço eletrônico e o perfil possuído, este último composto pelo nome de exibição, pela URL recém-obtida, por uma imagem de banner padrão e pela biografia.
3. **Derivação criptográfica da senha.** A senha em texto claro é submetida ao serviço de *hashing* e o resumo resultante substitui o valor original no agregado, por meio de método de comportamento da entidade.
4. **Persistência.** O repositório adiciona a entidade ao contexto e consolida a transação.
5. **Projeção da resposta.** Retorna-se um `Result<CreateUserResult>` contendo exclusivamente os dados públicos do usuário criado.

**4.7.2 Tratamento Criptográfico da Senha**

O armazenamento de senhas foi implementado por meio do componente `PasswordHasher<TUser>` do ASP.NET Core Identity, encapsulado por uma abstração própria (`IPasswordHashService`) que expõe apenas duas operações: derivar o resumo e verificar uma senha candidata contra um resumo existente.

A escolha desse componente, em detrimento de uma implementação própria, fundamenta-se em três propriedades que ele garante e que constituem requisitos consolidados da literatura de segurança aplicada: (i) emprega uma função de derivação de chave baseada em senha com múltiplas iterações — e não uma função de *hash* criptográfico simples —, elevando deliberadamente o custo computacional de tentativas de força bruta; (ii) gera um sal criptograficamente aleatório e distinto para cada senha, o que neutraliza ataques por tabelas pré-computadas e impede que senhas idênticas produzam resumos idênticos; e (iii) codifica, no próprio resultado persistido, um cabeçalho de versionamento do formato, juntamente com o sal e os parâmetros de iteração, o que permite a migração transparente para configurações mais robustas sem invalidar as credenciais já cadastradas.

Ressalta-se que a senha em texto claro possui existência efêmera: transita pela requisição, é imediatamente convertida em resumo e nunca é persistida nem registrada em log. A verificação, por sua vez, jamais compara textos claros — submete a senha candidata à mesma derivação, utilizando o sal extraído do resumo armazenado, e compara os resumos resultantes.

**4.7.3 Emissão e Validação do Token JWT**

Autenticado o par de credenciais, o serviço `TokenManager` compõe um *JSON Web Token* assinado. O token carrega duas reivindicações: a reivindicação de sujeito, preenchida com o nome de exibição, e a reivindicação de identificador único do token, preenchida com o identificador do usuário. A assinatura utiliza o algoritmo HMAC com SHA-256 sobre uma chave simétrica, e o token recebe emissor, público-alvo e prazo de validade obtidos da configuração da aplicação — nunca embutidos no código-fonte.

A validação ocorre no *middleware* de autenticação registrado na inicialização da aplicação, parametrizado por um conjunto explícito de verificações: validade temporal, com tolerância de desvio de relógio deliberadamente reduzida a um segundo; correspondência de público-alvo e de emissor; e verificação da assinatura contra a chave simétrica. A adoção de tolerância mínima de desvio de relógio é decisão consciente: o valor padrão da plataforma, de cinco minutos, estenderia a janela de aceitação de tokens já expirados.

O controle de acesso é aplicado de forma declarativa, por meio do atributo de autorização sobre as ações dos *controllers*. É relevante ressaltar a natureza *stateless* do mecanismo: o servidor não consulta o banco de dados para validar a sessão a cada requisição — a simples verificação criptográfica da assinatura e das reivindicações é suficiente, o que elimina uma operação de entrada e saída por requisição e viabiliza a escalabilidade pretendida.

**4.7.4 Gerenciamento da Sessão no Cliente**

Recebido o token, o *hook* `useAuthorization` executa o procedimento de estabelecimento da sessão no navegador. Em vez de arbitrar um prazo próprio de validade para o armazenamento local, o *hook* **decodifica a reivindicação de expiração contida no próprio token** e utiliza esse instante como prazo de validade do *cookie* de acesso (Quadro 9). Essa sincronização é intencional: garante que o artefato de sessão do cliente e a credencial aceita pelo servidor expirem simultaneamente, eliminando o estado inconsistente em que o navegador supõe estar autenticado enquanto o servidor já rejeita suas requisições.

Quadro 9 – Sincronização entre validade do *cookie* e expiração do token

```typescript
const decoded = jwtDecode<{ exp: number }>(request.token);
const expiresAt = new Date(decoded.exp * 1000);

Cookies.set("access-token", request.token, { expires: expiresAt, sameSite: "strict" });
Cookies.set("user", JSON.stringify(request.user), { expires: expiresAt, sameSite: "strict" });
```

Fonte: Elaborado pelos autores (2026).

Persistem-se dois artefatos: o token, consumido pelo interceptador HTTP descrito na seção 4.2.4, e uma representação reduzida do perfil, utilizada para renderização imediata dos elementos de identidade da interface sem requisição adicional ao servidor. Ambos são gravados com a diretiva `SameSite=Strict`, que instrui o navegador a não anexá-los em requisições originadas de outros sítios, mitigando ataques de falsificação de requisição entre sítios.

A proteção das rotas privadas é implementada no *layout* do grupo de rotas autenticadas: em efeito colateral executado após a montagem, verifica-se a presença do token; na ausência, redireciona-se para a tela de autenticação. Havendo token, decodifica-se sua reivindicação de expiração e, caso já ultrapassada, os artefatos de sessão são removidos e o redirecionamento é efetuado. Esse mecanismo constitui controle de experiência do usuário, e não de segurança — a autoridade sobre o acesso permanece integralmente no servidor, que rejeitará qualquer requisição sem token válido independentemente do comportamento do cliente.

**4.8 Integração com a Tripo API**

A geração tridimensional do NeuroMeshStudio ocorre por meio da integração com a Tripo API, plataforma especializada em reconstrução 3D baseada em Inteligência Artificial generativa. A API suporta diferentes abordagens de geração — *Image to Model*, *Text to Model* e *Multiview to Model* —, das quais a presente implementação emprega o método *Image to Model*, no qual o sistema recebe uma imagem bidimensional enviada pelo usuário e realiza sua conversão automática em uma malha tridimensional texturizada, conforme demonstrado na Figura 16.

Entre os principais parâmetros configuráveis da API destacam-se o limite de polígonos (*face limit*), a qualidade de textura, a ativação de renderização baseada em física (PBR), o esquema de compressão e a versão do modelo generativo empregado. A implementação parametriza a requisição de criação com texturização PBR ativada, qualidade de textura padrão, limite de vinte mil faces e compressão de geometria — configuração que busca equilíbrio entre fidelidade visual e leveza da malha, requisito determinante para viabilizar a renderização em tempo real no navegador, ambiente cujo orçamento de memória e de processamento gráfico é significativamente mais restrito que o de aplicações nativas.

Toda a comunicação com o provedor foi encapsulada em um serviço único (`TripoService`), registrado no contêiner de injeção de dependências como cliente HTTP tipado. Essa forma de registro é tecnicamente relevante: o cliente tipado é gerenciado por uma fábrica que mantém um reservatório de manipuladores de mensagem reutilizáveis, evitando tanto o esgotamento de portas efêmeras decorrente da instanciação repetida de clientes quanto a obsolescência de resolução de nomes característica de instâncias estáticas de longa duração — problemas críticos em um serviço que realiza consultas periódicas de estado em alta frequência.

O serviço expõe cinco operações, correspondentes aos recursos consumidos do provedor: criação da tarefa de geração, consulta de estado de tarefa, verificação de aptidão ao *rigging*, execução do *rigging* e aplicação de animações por reorientação de esqueleto. Em todas elas, a chave de autenticação é obtida da configuração da aplicação e injetada no cabeçalho de autorização — nunca trafegando pelo navegador —, e a desserialização das respostas é configurada para ignorar diferenças de caixa nos nomes das propriedades, acomodando a convenção *snake_case* adotada pelo provedor sem exigir anotação exaustiva dos contratos.

Figura 16 – Geração do Modelo do Personagem Link Zelda via NeuroMeshStudio

**4.9 Fluxo de Processamento e Renderização de Modelos**

Esta seção descreve o *pipeline* de geração tridimensional, principal fluxo do sistema. Sua compreensão exige o reconhecimento de uma restrição fundamental do domínio: **a inferência de reconstrução tridimensional é uma operação de longa duração e latência não determinística**, cujo tempo de conclusão varia conforme a complexidade da imagem de entrada e a carga instantânea dos servidores de GPU do provedor. Esse tempo é ordens de grandeza superior ao limite tolerável para uma requisição HTTP síncrona — o próprio cliente da aplicação impõe tempo limite de vinte segundos. É essa restrição que determina toda a arquitetura do fluxo: nenhuma etapa do *pipeline* bloqueia a espera do resultado; todas operam sob o modelo de **submissão de tarefa e consulta periódica de estado** (*polling*).

A orquestração completa foi implementada no *hook* `useGenerateModel`, que atua como máquina de estados finitos no cliente, transitando entre os estados `idle`, `generating`, `checking_rig` e `rigging`, e mantendo, para cada etapa, o percentual de progresso reportado pelo provedor. A opção por orquestrar no cliente decorre da própria natureza *stateless* do servidor: como a API não mantém estado de tarefa entre requisições, o cliente é o único componente com contexto contínuo sobre o andamento do *pipeline*.

**4.9.1 Etapa de Submissão**

O fluxo inicia-se com o anexo de uma imagem de referência no painel de geração do *Studio*. O arquivo é submetido à API em corpo `multipart/form-data`, acompanhado do tipo de geração e da versão do modelo generativo.

No servidor, o *handler* de geração executa uma etapa preparatória indispensável: **a externalização da imagem**. O provedor de IA não recebe conteúdo binário no corpo da requisição de criação — exige uma URL publicamente acessível. Assim, o fluxo binário recebido é primeiramente submetido à plataforma de mídia, que o otimiza e devolve um endereço seguro; somente então a tarefa é criada no provedor, tendo essa URL como entrada. Essa dependência explica por que a plataforma de mídia é componente obrigatório do *pipeline* de geração, e não mero repositório de avatares.

A resposta da criação não contém a malha, mas exclusivamente o identificador da tarefa (*task id*). Esse identificador é o único elemento propagado ao cliente e constitui a chave de correlação de todas as etapas subsequentes.

**4.9.2 Etapa de Monitoramento Assíncrono**

De posse do identificador, o cliente inicia o procedimento de consulta periódica, implementado por uma função que encapsula um temporizador em uma promessa. A cada cinco segundos, consulta-se o ponto de extremidade de estado, que repassa a consulta ao provedor e devolve o estado corrente e o percentual de progresso da tarefa. O valor de progresso alimenta o componente visual de carregamento, convertendo uma espera opaca em feedback contínuo — mitigação de usabilidade necessária para operações que podem se estender por minutos.

O ciclo encerra-se em duas condições terminais: estado de sucesso, que resolve a promessa com os dados da tarefa e libera a etapa seguinte; ou estado de falha, que a rejeita e interrompe o *pipeline*. O intervalo de cinco segundos foi definido empiricamente como equilíbrio entre a granularidade da atualização de progresso e o volume de requisições geradas ao provedor.

**4.9.3 Etapas de Verificação e Execução do Rigging**

Concluída a geração da malha estática, o *pipeline* transita para a avaliação de aptidão à animação, descrita em detalhe na seção 4.10.

**4.9.4 Intermediação do Artefato e Renderização**

Obtida a URL final do artefato — seja a malha estática, seja a versão com esqueleto —, o cliente **não a consome diretamente**. Toda URL é reescrita para o ponto de extremidade de intermediação da API, que recebe o endereço como parâmetro de consulta, realiza a transferência do conteúdo no servidor e o devolve ao navegador com o tipo de mídia `model/gltf-binary`.

Essa indireção, embora acrescente um salto de rede, resolve três problemas concretos e simultâneos: (i) as URLs emitidas pelo provedor são assinadas e possuem validade temporal restrita, de modo que o consumo direto tornaria o artefato inacessível após sua expiração; (ii) o domínio do provedor não declara política de origem cruzada compatível com o domínio da aplicação, o que faria o navegador bloquear a leitura do recurso pelo contexto WebGL; e (iii) a intermediação permite que a API mantenha controle sobre o tráfego de saída dos artefatos. Trata-se, portanto, de decisão arquitetural determinada por restrições do modelo de segurança do navegador, e não de preferência estilística.

O arquivo assim obtido é carregado no *viewport* central do *Studio*, renderizado sobre WebGL por meio da camada declarativa construída sobre a biblioteca Three.js, permitindo ao usuário orbitar, aproximar, inspecionar e avaliar o modelo em tempo real, sem qualquer software especializado instalado localmente. Complementarmente, a URL do artefato ativo é persistida no armazenamento local do navegador, o que permite restaurar o último modelo visualizado após recarregamento da página e alimentar o cartão de "criações recentes" da tela inicial — funcionalidade de continuidade de trabalho obtida sem custo adicional de requisição ao servidor.

**4.9.5 Gerenciamento de Estado no Cliente**

A sustentação do *pipeline* na camada de apresentação apoia-se em dois mecanismos complementares de gerenciamento de estado, cuja distinção conceitual é relevante.

O primeiro corresponde ao **estado efêmero de orquestração**, encapsulado em *hooks* próprios. O *hook* `useGenerateModel` mantém o estágio corrente da máquina de estados, o percentual de progresso, o indicador de processamento e a URL do artefato resultante, expondo à interface uma superfície mínima composta pela função de disparo e pelos valores observáveis. O *hook* `useAuthorization`, por sua vez, encapsula a mutação de autenticação, a decodificação do token, o estabelecimento dos artefatos de sessão e o redirecionamento subsequente. Em ambos os casos, o encapsulamento em *hooks* isola completamente os componentes visuais da lógica de comunicação e de controle de fluxo: o painel de geração, por exemplo, desconhece a existência do provedor de IA, das etapas de verificação ou do mecanismo de consulta periódica — recebe apenas uma função e um indicador booleano.

O segundo corresponde ao **estado de servidor**, gerenciado declarativamente pela biblioteca TanStack Query. Coleções obtidas do *Back-End* — o feed público e a listagem pessoal de modelos — são declaradas como consultas identificadas por chaves de cache, o que confere automaticamente deduplicação de requisições concorrentes, memorização dos resultados e recarregamento sob demanda. As operações de escrita — cadastro, atualização de perfil, salvamento e exclusão de modelos — são declaradas como mutações, cujos manipuladores de sucesso invalidam as chaves de cache afetadas, conforme descrito na seção 4.11.1. A adoção dessa separação evita o antipadrão comum de replicar dados do servidor em estado local de componente, prática que introduz divergências entre a informação exibida e a efetivamente persistida.

**4.10 Aptidão ao Rigging e Bifurcação do Pipeline**

O *rigging* consiste na construção de uma estrutura hierárquica de ossos vinculada à malha e na definição dos pesos de influência de cada osso sobre os vértices da geometria, etapa que converte um objeto estático em um ativo animável. Sua aplicação, contudo, **não é universal**: a inferência automática de esqueleto pressupõe que a geometria reconstruída seja reconhecível como pertencente a uma morfologia conhecida. Objetos inanimados, formas abstratas ou reconstruções com topologia ambígua não admitem esqueletização coerente.

Por essa razão, o *pipeline* implementa uma bifurcação condicional, cuja decisão é tomada em três momentos encadeados:

**a) Submissão da verificação.** Concluída a geração, o cliente aciona o ponto de extremidade de verificação, que repassa ao provedor o identificador da tarefa base. Coerentemente com o modelo assíncrono adotado em todo o sistema, essa verificação **também é uma tarefa**, e não uma resposta imediata: o provedor devolve um novo identificador, que exige novo ciclo de consulta periódica.

**b) Classificação morfológica.** Concluída a verificação, seu resultado contém o tipo morfológico inferido para a geometria. O sistema opera com uma lista de tipos admitidos — *aquatic*, *avian*, *biped*, *hexapod*, *octopod*, *quadruped* e *serpentine* —, correspondentes às topologias esqueléticas suportadas pelo provedor. O valor retornado é normalizado (conversão para caixa baixa e remoção de espaços) antes da comparação, precaução necessária diante da variabilidade de formatação observada nas respostas do serviço externo.

**c) Bifurcação.** Na hipótese de o tipo inferido não pertencer ao conjunto admitido — situação que abrange tanto morfologias não suportadas quanto a ausência de classificação —, o *pipeline* é **encerrado de forma controlada, e não interpretado como falha**. Recupera-se a URL da malha estática já produzida na etapa de geração e o artefato é entregue ao usuário por meio do mecanismo de intermediação descrito na seção 4.9.4. Essa decisão de projeto é metodologicamente relevante: um objeto não animável ainda constitui entrega de valor — o usuário obtém a malha texturizada solicitada —, de modo que tratar a inaptidão ao *rigging* como erro representaria degradação injustificada da experiência.

Na hipótese afirmativa, a máquina de estados transita para o estágio de *rigging*, submetendo ao provedor o identificador da tarefa base acompanhado do tipo morfológico inferido, do formato de saída `.glb` e da especificação de esqueleto adotada. Nova tarefa é criada, novo ciclo de consulta periódica é executado e, ao término, a URL da malha esqueletizada substitui a estática como artefato ativo do *Studio*.

Para modelos assim esqueletizados, disponibiliza-se ainda a aplicação de animações por reorientação de esqueleto (*retargeting*), na qual a API submete ao provedor um conjunto predefinido de ciclos — repouso, caminhada, corrida e salto —, com a diretiva de animação em posição fixa, adequada à pré-visualização no *viewport*. A definição do conjunto de animações no servidor, e não no cliente, garante que apenas combinações previamente validadas sejam submetidas ao provedor.

Registra-se, como limitação da implementação corrente, que a lista de tipos morfológicos admitidos reside no cliente. Sua realocação para o servidor é apontada na seção 4.12 como evolução necessária, uma vez que regras de negócio hospedadas no navegador não podem ser atualizadas sem nova publicação da interface, tampouco garantidas contra manipulação.

**4.11 Persistência e Ciclo de Vida do Ativo Tridimensional**

Concluída a geração, o artefato existe apenas como recurso temporário no domínio do provedor. Sua incorporação definitiva ao acervo do usuário requer uma operação explícita de salvamento, cujo fluxo distribui responsabilidades entre três sistemas de armazenamento distintos.

**4.11.1 Salvamento**

A operação inicia-se na barra de ferramentas do *Studio*. Previamente à submissão, o sistema captura uma miniatura do modelo diretamente do contexto de renderização WebGL, extraindo o conteúdo do *canvas* como imagem codificada em base64 — procedimento que dispensa o usuário de fornecer manualmente uma imagem de capa e assegura que a miniatura corresponda fielmente ao enquadramento visualizado. Antes do envio, essa representação é convertida em objeto binário e anexada ao corpo `multipart/form-data` juntamente com o título, a descrição, o indicador de visibilidade e a URL do modelo.

No servidor, a persistência ocorre em quatro etapas sequenciais:

1. **Repatriação do binário.** A API transfere para si o conteúdo da malha a partir da URL do provedor, obtendo o arranjo de bytes. Essa etapa é o que efetivamente desvincula o acervo da plataforma da disponibilidade e da política de retenção do serviço externo.
2. **Externalização da malha.** Os bytes são enviados ao serviço de armazenamento de objetos, sob nome de arquivo derivado de identificador único e tipo de conteúdo `model/gltf-binary`, obtendo-se a URL pública definitiva.
3. **Externalização da miniatura.** A imagem capturada é submetida à plataforma de mídia, obtendo-se a URL otimizada correspondente.
4. **Registro dos metadados.** O *handler* instancia a entidade de modelo com as duas URLs e os metadados descritivos, aplica o estado de visibilidade por meio do método de comportamento e delega ao repositório a associação com o usuário autor e a consolidação transacional.

Concluída a operação, o cliente invalida as chaves de cache correspondentes à listagem pessoal e ao feed público. Esse mecanismo — próprio da biblioteca de gerenciamento de estado assíncrono adotada — dispensa a manipulação manual das coleções em memória: a invalidação sinaliza que os dados se tornaram obsoletos, e a biblioteca recarrega apenas as consultas efetivamente montadas na interface, assegurando consistência entre a visão do usuário e o estado do servidor.

**4.11.2 Exclusão e Consistência entre Sistemas Heterogêneos**

A exclusão evidencia o custo inerente à distribuição do armazenamento entre sistemas heterogêneos: como o registro relacional e os arquivos binários residem em serviços distintos, **não há transação distribuída que garanta atomicidade entre eles**. A remoção foi, portanto, implementada como sequência ordenada e verificada de operações compensáveis: remoção da miniatura na plataforma de mídia, remoção da malha no serviço de armazenamento de objetos e, por último, remoção do registro no banco relacional. A falha em qualquer etapa interrompe a sequência e retorna resultado de erro, preservando o registro relacional e evitando que a exclusão parcial produza referências pendentes para arquivos inexistentes.

A ordenação adotada — binários antes do registro — é deliberada: caso a operação seja interrompida, permanece no banco um registro cujos arquivos foram removidos, situação detectável e reparável por rotina de auditoria; a ordem inversa produziria arquivos órfãos sem qualquer referência que permitisse localizá-los. A identificação dos recursos a remover é derivada das próprias URLs persistidas, mediante extração do identificador público na plataforma de mídia e do caminho relativo no serviço de objetos.

**4.11.3 Publicação na Comunidade**

Modelos salvos com o indicador de visibilidade ativado passam a integrar o feed da comunidade, consumido na tela inicial por meio da consulta descrita na seção 4.3.4. A interface complementa a experiência com filtragem textual executada no cliente sobre a coleção já carregada, permitindo busca por título ou por autor sem requisição adicional ao servidor — abordagem adequada à volumetria atual do acervo e apontada na seção 4.12 como candidata à substituição por paginação e filtragem no servidor à medida que a base cresça.

**4.12 Considerações Metodológicas**

A metodologia adotada neste trabalho permitiu integrar, de maneira unificada, conceitos de engenharia de software, computação gráfica, computação em nuvem e Inteligência Artificial generativa em uma plataforma distribuída voltada à automação da modelagem tridimensional. A construção do NeuroMeshStudio envolveu desde etapas de prototipação e definição arquitetural até a implementação de serviços escaláveis integrados por APIs, possibilitando a comunicação entre diferentes componentes do sistema de forma modular e desacoplada. A utilização de princípios como *Clean Architecture*, *Repository Pattern*, *Result Pattern* e arquitetura em três camadas contribuiu para a organização estrutural da aplicação, favorecendo manutenção, reutilização de código e expansão futura da plataforma.

Do ponto de vista metodológico, verifica-se que as decisões de projeto mais determinantes do artefato não decorreram de preferências estilísticas, mas de restrições objetivas impostas pelo domínio. A latência não determinística da inferência de IA determinou a adoção integral do modelo assíncrono de submissão e consulta periódica de estado, bem como a alocação da orquestração do *pipeline* no cliente. O modelo de segurança de origem cruzada dos navegadores, somado à validade temporal restrita das URLs assinadas do provedor, determinou a intermediação obrigatória do tráfego binário pela API. O volume dos artefatos determinou a estratégia de persistência por referência, com a consequente distribuição do armazenamento entre serviços especializados e o custo associado à ausência de atomicidade transacional entre eles. A necessidade de escalabilidade horizontal determinou a autenticação *stateless* baseada em token assinado. Cada uma dessas escolhas é, portanto, rastreável a um requisito concreto — característica que se buscou tornar explícita ao longo deste capítulo.

A adoção de serviços especializados — plataforma de mídia para imagens, serviço de armazenamento de objetos para malhas, Tripo API para reconstrução tridimensional e Microsoft Azure para hospedagem — demonstrou-se adequada para aplicações que demandam processamento intensivo e alta disponibilidade. A renderização tridimensional diretamente no navegador por meio da biblioteca Three.js evidenciou o potencial das tecnologias web modernas na construção de ambientes interativos e acessíveis, eliminando a necessidade de softwares locais especializados para visualização dos modelos gerados.

Cabe registrar, em observância ao rigor científico exigido pela descrição de um artefato experimental, o conjunto de limitações identificadas na implementação corrente, as quais delimitam o escopo dos resultados apresentados e orientam a continuidade da pesquisa:

* **Autoridade sobre a identidade do requisitante.** Determinadas operações autenticadas identificam o usuário por meio de parâmetro fornecido pelo próprio cliente, e não pela reivindicação de identidade contida no token validado pelo servidor. A derivação da identidade exclusivamente a partir do token constitui correção prioritária, por eliminar a possibilidade de acesso a recursos de terceiros mediante manipulação de parâmetros.
* **Exposição do ponto de extremidade de intermediação.** O recurso de transferência de arquivos opera sem exigência de autenticação e aceita endereço arbitrário como parâmetro. Sua restrição a uma lista de domínios confiáveis e a inclusão sob política de autorização são medidas necessárias para impedir seu uso como intermediário genérico de requisições.
* **Unicidade do identificador de autenticação.** O esquema atual não impõe restrição de unicidade sobre a coluna de endereço eletrônico, o que admite, em nível de banco, o cadastro de registros duplicados. A criação de índice único é medida de baixa complexidade e alto impacto sobre a integridade do modelo.
* **Granularidade semântica das respostas de erro.** Conforme discutido na seção 4.2.3, a representação das falhas por mensagens textuais conduz à uniformização das respostas em `400 Bad Request`. A evolução do tipo `Result<T>` para um discriminador tipado de categorias de erro permitiria a tradução para os códigos de estado HTTP semanticamente adequados.
* **Localização das regras de decisão do pipeline.** A classificação de aptidão ao *rigging* é avaliada no cliente, condição que a torna dependente de nova publicação da interface para atualização e insuscetível de garantia contra manipulação. Sua migração para a camada de aplicação é recomendada.
* **Robustez do mecanismo de consulta periódica.** O procedimento opera com intervalo fixo, sem recuo exponencial nem limite máximo de tentativas, de modo que uma tarefa que permaneça indefinidamente em estado não terminal mantém o ciclo ativo. A introdução de tempo limite global e de recuo progressivo é recomendada.
* **Comunicação de falhas ao usuário.** Erros ocorridos no decorrer do *pipeline* de geração são registrados no console do navegador, porém não são propagados à interface, o que pode induzir o usuário a interpretar uma falha como inatividade do sistema.
* **Escopo funcional da integração.** Das modalidades de geração disponibilizadas pelo provedor, encontra-se implementada a conversão a partir de imagem única; as modalidades baseadas em texto e em múltiplas vistas, bem como a exportação em formatos adicionais ao `.glb`, permanecem como trabalhos futuros.

Outro aspecto relevante da metodologia está relacionado à proposta de integração entre geração automatizada de modelos 3D e funcionalidades colaborativas de comunidade digital. A possibilidade de armazenar, compartilhar e visualizar criações públicas amplia o escopo da plataforma para além de uma simples ferramenta de geração, aproximando-a de ambientes contemporâneos voltados à criação colaborativa de ativos digitais.

Dessa forma, o NeuroMeshStudio consolida-se como uma proposta experimental alinhada às tendências atuais da computação gráfica e da Inteligência Artificial aplicada, apresentando uma solução acessível, escalável e potencialmente aplicável em diferentes áreas, como desenvolvimento de jogos digitais, prototipação de produtos, realidade virtual, realidade aumentada e produção de conteúdo interativo. Além de contribuir academicamente para estudos relacionados à automação da modelagem tridimensional, o projeto também evidencia o potencial da Inteligência Artificial como ferramenta de democratização da criação digital, reduzindo barreiras técnicas tradicionalmente presentes no fluxo de produção 3D.
