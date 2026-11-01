/**
 * Production-ready Python source code implementations of the GUI Calculator
 * with instant calculation and Light/Dark themes.
 */

export interface PythonScript {
  id: string;
  title: string;
  filename: string;
  library: string;
  description: string;
  prerequisites: string;
  code: string;
}

export const PYTHON_TKINTER_CODE = `"""
Calculadora Gráfica em Python com Cálculo Instantâneo e Temas Claro/Escuro
Biblioteca: Tkinter (Padrão do Python - Não requer instalação externa)
Funcionalidades:
  - Operações aritméticas básicas: +, -, *, /, %, ** (potência)
  - Cálculo instantâneo conforme os números são digitados ou clicados
  - Alternância dinâmica entre Tema Claro e Tema Escuro
  - Suporte a teclado físico e botões gráficos
  - Avaliação matemática segura via AST (sem vulnerabilidade de eval puro)
"""

import tkinter as tk
from tkinter import font
import ast
import operator
import math

# Operadores aritméticos suportados de forma segura
OPERADORES_SEGUROS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.FloorDiv: operator.floordiv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

def avaliar_expressao_segura(expr: str):
    """Avalia expressões matemáticas básicas de forma estrita e segura."""
    if not expr or not expr.strip():
        return ""
    
    # Normaliza símbolos comuns para operadores Python
    sanitizada = expr.replace("×", "*").replace("÷", "/").replace("^", "**").replace(",", ".")
    
    # Remove operadores pendentes no final para o cálculo instantâneo
    while sanitizada and sanitizada[-1] in "+-*/%^. ":
        sanitizada = sanitizada[:-1].strip()
    
    if not sanitizada:
        return ""
        
    try:
        arvore = ast.parse(sanitizada, mode='eval')
        
        def _avaliar_no(node):
            if isinstance(node, ast.Expression):
                return _avaliar_no(node.body)
            elif isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                return node.value
            elif isinstance(node, ast.BinOp):
                tipo_op = type(node.op)
                if tipo_op in OPERADORES_SEGUROS:
                    esquerda = _avaliar_no(node.left)
                    direita = _avaliar_no(node.right)
                    return OPERADORES_SEGUROS[tipo_op](esquerda, direita)
                raise ValueError("Operador não suportado")
            elif isinstance(node, ast.UnaryOp):
                tipo_op = type(node.op)
                if tipo_op in OPERADORES_SEGUROS:
                    return OPERADORES_SEGUROS[tipo_op](_avaliar_no(node.operand))
                raise ValueError("Operador unário não suportado")
            else:
                raise ValueError("Expressão inválida")
                
        resultado = _avaliar_no(arvore)
        
        # Formata resultado (remove .0 de inteiros)
        if isinstance(resultado, float) and resultado.is_integer():
            return str(int(resultado))
        elif isinstance(resultado, float):
            return f"{resultado:.8f}".rstrip("0").rstrip(".")
        return str(resultado)
        
    except ZeroDivisionError:
        return "Divisão por zero"
    except Exception:
        return ""


class CalculadoraPythonGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Calculadora Python")
        self.root.geometry("380x560")
        self.root.minsize(340, 500)
        
        # Paletas de cores para temas Claro e Escuro
        self.temas = {
            "escuro": {
                "bg": "#121214",
                "display_bg": "#202024",
                "display_fg": "#e1e1e6",
                "preview_fg": "#00b37e",
                "btn_num_bg": "#29292e",
                "btn_num_fg": "#f4f4f5",
                "btn_num_active": "#323238",
                "btn_op_bg": "#025db9",
                "btn_op_fg": "#ffffff",
                "btn_op_active": "#004b99",
                "btn_action_bg": "#7c3aed",
                "btn_action_fg": "#ffffff",
                "btn_theme_bg": "#202024",
                "btn_theme_fg": "#a8a8b3",
                "border": "#323238"
            },
            "claro": {
                "bg": "#f0f2f5",
                "display_bg": "#ffffff",
                "display_fg": "#121214",
                "preview_fg": "#047857",
                "btn_num_bg": "#ffffff",
                "btn_num_fg": "#1f2937",
                "btn_num_active": "#e5e7eb",
                "btn_op_bg": "#2563eb",
                "btn_op_fg": "#ffffff",
                "btn_op_active": "#1d4ed8",
                "btn_action_bg": "#9333ea",
                "btn_action_fg": "#ffffff",
                "btn_theme_bg": "#e4e4e7",
                "btn_theme_fg": "#374151",
                "border": "#d1d5db"
            }
        }
        
        self.tema_atual = "escuro"
        self.widgets_botoes = []
        
        # Variáveis de texto
        self.var_expressao = tk.StringVar(value="")
        self.var_resultado = tk.StringVar(value="")
        
        # Configurar fontes
        self.fonte_display = font.Font(family="Consolas", size=24, weight="bold")
        self.fonte_preview = font.Font(family="Arial", size=13, weight="bold")
        self.fonte_botoes = font.Font(family="Arial", size=14, weight="bold")
        
        self.criar_interface()
        self.vincular_eventos()
        self.aplicar_tema()

    def criar_interface(self):
        # Barra superior com Alternador de Tema
        self.frame_topo = tk.Frame(self.root, padx=16, pady=10)
        self.frame_topo.pack(fill="x")
        
        self.lbl_titulo = tk.Label(self.frame_topo, text="Calculadora", font=("Arial", 12, "bold"))
        self.lbl_titulo.pack(side="left")
        
        self.btn_tema = tk.Button(
            self.frame_topo,
            text="☀ Tema Claro",
            font=("Arial", 10),
            relief="flat",
            cursor="hand2",
            padx=10,
            pady=4,
            command=self.alternar_tema
        )
        self.btn_tema.pack(side="right")
        
        # Área do Display (Expressão e Resultado Instantâneo)
        self.frame_display = tk.Frame(self.root, padx=16, pady=8)
        self.frame_display.pack(fill="x", padx=16, pady=4)
        
        # Campo de entrada da expressão
        self.entry_expressao = tk.Entry(
            self.frame_display,
            textvariable=self.var_expressao,
            font=self.fonte_display,
            justify="right",
            relief="flat",
            bd=8
        )
        self.entry_expressao.pack(fill="x", ipady=6)
        self.entry_expressao.focus_set()
        
        # Rótulo de Resultado Instantâneo
        self.lbl_preview = tk.Label(
            self.frame_display,
            textvariable=self.var_resultado,
            font=self.fonte_preview,
            anchor="e"
        )
        self.lbl_preview.pack(fill="x", pady=(4, 6))
        
        # Teclado de Botões
        self.frame_teclado = tk.Frame(self.root, padx=16, pady=12)
        self.frame_teclado.pack(fill="both", expand=True)
        
        # Grid de botões: (texto, linha, coluna, tipo, span_col)
        botoes = [
            ("C", 0, 0, "action", 1),
            ("⌫", 0, 1, "action", 1),
            ("%", 0, 2, "op", 1),
            ("÷", 0, 3, "op", 1),
            
            ("7", 1, 0, "num", 1),
            ("8", 1, 1, "num", 1),
            ("9", 1, 2, "num", 1),
            ("×", 1, 3, "op", 1),
            
            ("4", 2, 0, "num", 1),
            ("5", 2, 1, "num", 1),
            ("6", 2, 2, "num", 1),
            ("-", 2, 3, "op", 1),
            
            ("1", 3, 0, "num", 1),
            ("2", 3, 1, "num", 1),
            ("3", 3, 2, "num", 1),
            ("+", 3, 3, "op", 1),
            
            ("0", 4, 0, "num", 1),
            (".", 4, 1, "num", 1),
            ("^", 4, 2, "op", 1),
            ("=", 4, 3, "action", 1),
        ]
        
        for c in range(4):
            self.frame_teclado.columnconfigure(c, weight=1)
        for r in range(5):
            self.frame_teclado.rowconfigure(r, weight=1)
            
        for texto, linha, col, tipo, span in botoes:
            btn = tk.Button(
                self.frame_teclado,
                text=texto,
                font=self.fonte_botoes,
                relief="flat",
                cursor="hand2",
                command=lambda t=texto: self.ao_clicar_botao(t)
            )
            btn.grid(row=linha, column=col, columnspan=span, sticky="nsew", padx=3, pady=3)
            self.widgets_botoes.append((btn, tipo))

    def vincular_eventos(self):
        # Atualização instantânea ao digitar no teclado
        self.var_expressao.trace_add("write", lambda *args: self.atualizar_calculo_instantaneo())
        self.entry_expressao.bind("<Return>", lambda event: self.confirmar_resultado())
        self.entry_expressao.bind("<Escape>", lambda event: self.limpar_tudo())

    def ao_clicar_botao(self, texto):
        if texto == "C":
            self.limpar_tudo()
        elif texto == "⌫":
            atual = self.var_expressao.get()
            if atual:
                self.var_expressao.set(atual[:-1])
        elif texto == "=":
            self.confirmar_resultado()
        else:
            self.var_expressao.set(self.var_expressao.get() + texto)
            
        # Manter foco no campo de entrada
        self.entry_expressao.icursor(tk.END)

    def atualizar_calculo_instantaneo(self):
        """Calcula o resultado em tempo real conforme o usuário digita."""
        expressao = self.var_expressao.get()
        if not expressao.strip():
            self.var_resultado.set("")
            return
            
        res = avaliar_expressao_segura(expressao)
        if res:
            self.var_resultado.set(f"= {res}")
        else:
            self.var_resultado.set("")

    def confirmar_resultado(self):
        """Aplica o resultado final na caixa de texto ao teclar Enter ou clicar '='."""
        expressao = self.var_expressao.get()
        res = avaliar_expressao_segura(expressao)
        if res and res != "Divisão por zero":
            self.var_expressao.set(res)
            self.var_resultado.set("")
            self.entry_expressao.icursor(tk.END)
        elif res == "Divisão por zero":
            self.var_resultado.set("Erro: Divisão por zero")

    def limpar_tudo(self):
        self.var_expressao.set("")
        self.var_resultado.set("")

    def alternar_tema(self):
        self.tema_atual = "claro" if self.tema_atual == "escuro" else "escuro"
        self.aplicar_tema()

    def aplicar_tema(self):
        cores = self.temas[self.tema_atual]
        
        # Janela principal e frames
        self.root.configure(bg=cores["bg"])
        self.frame_topo.configure(bg=cores["bg"])
        self.frame_display.configure(bg=cores["display_bg"])
        self.frame_teclado.configure(bg=cores["bg"])
        
        # Rótulos e botões do topo
        self.lbl_titulo.configure(bg=cores["bg"], fg=cores["display_fg"])
        btn_tema_texto = "☀ Tema Claro" if self.tema_atual == "escuro" else "🌙 Tema Escuro"
        self.btn_tema.configure(
            text=btn_tema_texto,
            bg=cores["btn_theme_bg"],
            fg=cores["btn_theme_fg"],
            activebackground=cores["border"]
        )
        
        # Display
        self.entry_expressao.configure(
            bg=cores["display_bg"],
            fg=cores["display_fg"],
            insertbackground=cores["display_fg"]
        )
        self.lbl_preview.configure(
            bg=cores["display_bg"],
            fg=cores["preview_fg"]
        )
        
        # Botões do teclado
        for btn, tipo in self.widgets_botoes:
            if tipo == "num":
                btn.configure(
                    bg=cores["btn_num_bg"],
                    fg=cores["btn_num_fg"],
                    activebackground=cores["btn_num_active"],
                    activeforeground=cores["btn_num_fg"]
                )
            elif tipo == "op":
                btn.configure(
                    bg=cores["btn_op_bg"],
                    fg=cores["btn_op_fg"],
                    activebackground=cores["btn_op_active"],
                    activeforeground=cores["btn_op_fg"]
                )
            elif tipo == "action":
                btn.configure(
                    bg=cores["btn_action_bg"],
                    fg=cores["btn_action_fg"],
                    activebackground=cores["btn_action_bg"],
                    activeforeground=cores["btn_action_fg"]
                )


if __name__ == "__main__":
    root = tk.Tk()
    app = CalculadoraPythonGUI(root)
    root.mainloop()
`;

export const PYTHON_CUSTOMTKINTER_CODE = `"""
Calculadora Gráfica Moderna em Python com CustomTkinter
Requisitos: pip install customtkinter
Funcionalidades:
  - Design contemporâneo com cantos arredondados e suporte High-DPI
  - Cálculo instantâneo em tempo real
  - Alternância nativa de Temas Claro e Escuro (set_appearance_mode)
  - Operações aritméticas completas (+, -, *, /, %, **)
"""

import customtkinter as ctk
import ast
import operator

# Configuração global inicial do CustomTkinter
ctk.set_appearance_mode("dark")  # Opções: "dark", "light"
ctk.set_default_color_theme("blue")

OPERADORES_SEGUROS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.FloorDiv: operator.floordiv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

def avaliar_expressao(expr: str):
    """Avaliação aritmética segura com suporte a operadores comuns."""
    if not expr or not expr.strip():
        return ""
    
    sanitizada = expr.replace("×", "*").replace("÷", "/").replace("^", "**").replace(",", ".")
    while sanitizada and sanitizada[-1] in "+-*/%^. ":
        sanitizada = sanitizada[:-1].strip()
        
    if not sanitizada:
        return ""
        
    try:
        arvore = ast.parse(sanitizada, mode='eval')
        def _no(node):
            if isinstance(node, ast.Expression):
                return _no(node.body)
            elif isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
                return node.value
            elif isinstance(node, ast.BinOp):
                op = type(node.op)
                if op in OPERADORES_SEGUROS:
                    return OPERADORES_SEGUROS[op](_no(node.left), _no(node.right))
            elif isinstance(node, ast.UnaryOp):
                op = type(node.op)
                if op in OPERADORES_SEGUROS:
                    return OPERADORES_SEGUROS[op](_no(node.operand))
            raise ValueError("Inválido")
            
        res = _no(arvore)
        if isinstance(res, float) and res.is_integer():
            return str(int(res))
        elif isinstance(res, float):
            return f"{res:.8f}".rstrip("0").rstrip(".")
        return str(res)
    except ZeroDivisionError:
        return "Divisão por zero"
    except Exception:
        return ""


class CalculadoraModerna(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("Calculadora Python Moderna")
        self.geometry("380x560")
        self.minsize(360, 520)
        
        self.modo_tema = "dark"
        self.var_expressao = ctk.StringVar(value="")
        self.var_resultado = ctk.StringVar(value="")
        
        self.criar_layout()
        self.vincular_atalhos()
        
    def criar_layout(self):
        # Cabeçalho com botão de tema
        self.header_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.header_frame.pack(fill="x", padx=18, pady=(16, 8))
        
        self.titulo_lbl = ctk.CTkLabel(
            self.header_frame,
            text="Calculadora Python",
            font=ctk.CTkFont(size=16, weight="bold")
        )
        self.titulo_lbl.pack(side="left")
        
        self.btn_tema = ctk.CTkButton(
            self.header_frame,
            text="☀ Claro",
            width=80,
            height=30,
            command=self.alternar_tema
        )
        self.btn_tema.pack(side="right")
        
        # Display Box
        self.display_frame = ctk.CTkFrame(self, corner_radius=12)
        self.display_frame.pack(fill="x", padx=18, pady=8)
        
        self.entry = ctk.CTkEntry(
            self.display_frame,
            textvariable=self.var_expressao,
            font=ctk.CTkFont(family="Consolas", size=26, weight="bold"),
            justify="right",
            height=50,
            border_width=0,
            fg_color="transparent"
        )
        self.entry.pack(fill="x", padx=12, pady=(8, 2))
        self.entry.focus_set()
        
        self.lbl_preview = ctk.CTkLabel(
            self.display_frame,
            textvariable=self.var_resultado,
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=("#10b981", "#34d399"),
            anchor="e"
        )
        self.lbl_preview.pack(fill="x", padx=14, pady=(0, 8))
        
        # Teclado de Botões
        self.botoes_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.botoes_frame.pack(fill="both", expand=True, padx=16, pady=12)
        
        for i in range(4):
            self.botoes_frame.columnconfigure(i, weight=1)
        for i in range(5):
            self.botoes_frame.rowconfigure(i, weight=1)
            
        botoes = [
            ("C", 0, 0, "action"), ("⌫", 0, 1, "action"), ("%", 0, 2, "op"), ("÷", 0, 3, "op"),
            ("7", 1, 0, "num"),    ("8", 1, 1, "num"),    ("9", 1, 2, "num"), ("×", 1, 3, "op"),
            ("4", 2, 0, "num"),    ("5", 2, 1, "num"),    ("6", 2, 2, "num"), ("-", 2, 3, "op"),
            ("1", 3, 0, "num"),    ("2", 3, 1, "num"),    ("3", 3, 2, "num"), ("+", 3, 3, "op"),
            ("0", 4, 0, "num"),    (".", 4, 1, "num"),    ("^", 4, 2, "op"),  ("=", 4, 3, "equals"),
        ]
        
        for texto, r, c, tipo in botoes:
            cor_fg, cor_hover = self.obter_cores_botao(tipo)
            btn = ctk.CTkButton(
                self.botoes_frame,
                text=texto,
                font=ctk.CTkFont(size=16, weight="bold"),
                fg_color=cor_fg,
                hover_color=cor_hover,
                corner_radius=10,
                command=lambda t=texto: self.clique(t)
            )
            btn.grid(row=r, column=c, sticky="nsew", padx=4, pady=4)

    def obter_cores_botao(self, tipo):
        if tipo == "num":
            return ("#e2e8f0", "#2d3748"), ("#cbd5e1", "#4a5568")
        elif tipo == "op":
            return "#2563eb", "#1d4ed8"
        elif tipo == "action":
            return "#64748b", "#475569"
        elif tipo == "equals":
            return "#059669", "#047857"
        return None, None

    def vincular_atalhos(self):
        self.var_expressao.trace_add("write", lambda *args: self.calcular_instantaneo())
        self.entry.bind("<Return>", lambda e: self.confirmar())
        self.entry.bind("<Escape>", lambda e: self.limpar())

    def clique(self, texto):
        if texto == "C":
            self.limpar()
        elif texto == "⌫":
            atual = self.var_expressao.get()
            if atual:
                self.var_expressao.set(atual[:-1])
        elif texto == "=":
            self.confirmar()
        else:
            self.var_expressao.set(self.var_expressao.get() + texto)
        self.entry.icursor("end")

    def calcular_instantaneo(self):
        expr = self.var_expressao.get()
        if not expr.strip():
            self.var_resultado.set("")
            return
        res = avaliar_expressao(expr)
        self.var_resultado.set(f"= {res}" if res else "")

    def confirmar(self):
        res = avaliar_expressao(self.var_expressao.get())
        if res and res != "Divisão por zero":
            self.var_expressao.set(res)
            self.var_resultado.set("")
            self.entry.icursor("end")

    def limpar(self):
        self.var_expressao.set("")
        self.var_resultado.set("")

    def alternar_tema(self):
        if self.modo_tema == "dark":
            self.modo_tema = "light"
            ctk.set_appearance_mode("light")
            self.btn_tema.configure(text="🌙 Escuro")
        else:
            self.modo_tema = "dark"
            ctk.set_appearance_mode("dark")
            self.btn_tema.configure(text="☀ Claro")


if __name__ == "__main__":
    app = CalculadoraModerna()
    app.mainloop()
`;

export const PYTHON_SCRIPTS: PythonScript[] = [
  {
    id: 'tkinter',
    title: 'Tkinter Padrão (Sem Dependências)',
    filename: 'calculadora_tkinter.py',
    library: 'tkinter (Biblioteca Nativa)',
    description: 'Funciona imediatamente em qualquer versão do Python 3 sem precisar instalar nada via pip. Possui cálculo em tempo real e alternância dinâmica de tema claro e escuro.',
    prerequisites: 'Python 3.8+ instalado (já vem com Tkinter por padrão).',
    code: PYTHON_TKINTER_CODE
  },
  {
    id: 'customtkinter',
    title: 'CustomTkinter Moderno',
    filename: 'calculadora_customtkinter.py',
    library: 'customtkinter (Interface Moderna)',
    description: 'Interface contemporânea com suporte High-DPI nativo, cantos arredondados, animações suaves e troca nativa de modo claro/escuro.',
    prerequisites: 'pip install customtkinter',
    code: PYTHON_CUSTOMTKINTER_CODE
  }
];
