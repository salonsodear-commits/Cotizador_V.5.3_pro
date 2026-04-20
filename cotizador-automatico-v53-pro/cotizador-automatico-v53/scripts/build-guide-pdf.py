#!/usr/bin/env python3
"""Genera la guía PDF 'Guia-Cotizador.pdf' en docs/."""
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, ListFlowable, ListItem
)

PRIMARY = HexColor('#2A4E77')
PRIMARY_DARK = HexColor('#1B3552')
ACCENT = HexColor('#3D6A9A')
BG_SOFT = HexColor('#F2F5F9')
CODE_BG = HexColor('#0F172A')
CODE_FG = HexColor('#E2E8F0')

OUT = Path(__file__).resolve().parent.parent / 'docs' / 'Guia-Cotizador.pdf'

styles = getSampleStyleSheet()

def S(name, **kw):
    base = styles['Normal']
    return ParagraphStyle(name=name, parent=base, **kw)

s_title = S('Title', fontName='Helvetica-Bold', fontSize=26,
            textColor=PRIMARY_DARK, leading=30, spaceAfter=10)
s_subtitle = S('Subtitle', fontName='Helvetica', fontSize=13,
               textColor=ACCENT, leading=18, spaceAfter=20)
s_h1 = S('H1', fontName='Helvetica-Bold', fontSize=18,
         textColor=PRIMARY_DARK, leading=22, spaceBefore=18, spaceAfter=8)
s_h2 = S('H2', fontName='Helvetica-Bold', fontSize=14,
         textColor=PRIMARY, leading=18, spaceBefore=12, spaceAfter=6)
s_h3 = S('H3', fontName='Helvetica-Bold', fontSize=12,
         textColor=PRIMARY, leading=15, spaceBefore=8, spaceAfter=4)
s_body = S('Body', fontName='Helvetica', fontSize=10.5,
           textColor=black, leading=15, alignment=TA_JUSTIFY, spaceAfter=6)
s_body_left = S('BodyLeft', fontName='Helvetica', fontSize=10.5,
                textColor=black, leading=15, alignment=TA_LEFT, spaceAfter=6)
s_bullet = S('Bullet', fontName='Helvetica', fontSize=10.5,
             textColor=black, leading=15, alignment=TA_LEFT)
s_code = S('Code', fontName='Courier', fontSize=9,
           textColor=CODE_FG, leading=12, leftIndent=8, rightIndent=8,
           backColor=CODE_BG, borderPadding=8, spaceBefore=4, spaceAfter=8)
s_note = S('Note', fontName='Helvetica-Oblique', fontSize=10,
           textColor=HexColor('#475569'), leading=14, spaceAfter=8)

def bullets(items, style=s_bullet):
    return ListFlowable(
        [ListItem(Paragraph(t, style), leftIndent=12, value='bullet') for t in items],
        bulletType='bullet', bulletColor=PRIMARY, leftIndent=14, bulletFontSize=10,
    )

def callout(text, color=BG_SOFT):
    t = Table([[Paragraph(text, s_body_left)]], colWidths=[16*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('BOX', (0,0), (-1,-1), 0.5, PRIMARY),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    return t

def code(text):
    return Paragraph('<font face="Courier">' +
                     text.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('\n','<br/>') +
                     '</font>', s_code)

def comparison_table(rows):
    data = [[Paragraph('<b>Término</b>', s_body_left),
             Paragraph('<b>Explicación en palabras simples</b>', s_body_left),
             Paragraph('<b>Analogía</b>', s_body_left)]]
    for r in rows:
        data.append([Paragraph(r[0], s_body_left),
                     Paragraph(r[1], s_body_left),
                     Paragraph(r[2], s_body_left)])
    t = Table(data, colWidths=[3*cm, 8*cm, 5*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), white),
        ('GRID', (0,0), (-1,-1), 0.3, HexColor('#CBD5E1')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [white, BG_SOFT]),
    ]))
    return t

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PRIMARY_DARK)
    canvas.rect(0, A4[1]-1.2*cm, A4[0], 1.2*cm, fill=1, stroke=0)
    canvas.setFillColor(white)
    canvas.setFont('Helvetica-Bold', 10)
    canvas.drawString(2*cm, A4[1]-0.8*cm, 'Cotizador Automático V5.3 PRO — Guía')
    canvas.setFont('Helvetica', 9)
    canvas.drawRightString(A4[0]-2*cm, A4[1]-0.8*cm, f'Página {doc.page}')
    canvas.setFillColor(HexColor('#94A3B8'))
    canvas.setFont('Helvetica', 8)
    canvas.drawString(2*cm, 1.2*cm,
        'Documento orientativo — requiere que un administrador configure la cuenta AWS.')
    canvas.restoreState()

def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(OUT), pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title='Guía Cotizador V5.3 PRO', author='Sistema de Cotización')

    story = []

    # PORTADA
    story += [
        Spacer(1, 3*cm),
        Paragraph('Guía del Cotizador', s_title),
        Paragraph('Publicación en internet + migración automática Excel → JSON', s_subtitle),
        Spacer(1, 1*cm),
        callout(
            'Esta guía explica, <b>en lenguaje sencillo</b>, qué es cada herramienta '
            '(API, AWS, S3, GitHub, Supabase), <b>cuáles necesitás realmente</b> para '
            'tu cotizador y <b>cómo hacer</b> que los Excel de un repositorio se '
            'conviertan automáticamente en JSON — sin dejar datos "quemados" dentro '
            'del código.'
        ),
        Spacer(1, 2*cm),
        Paragraph('<b>Contenido</b>', s_h3),
        bullets([
            '1. Qué querés lograr (en una frase)',
            '2. Glosario: API, AWS, S3, GitHub, Supabase',
            '3. Qué necesitás <b>realmente</b> para este proyecto',
            '4. Paso a paso para publicar la página',
            '5. Migración automática Excel → JSON',
            '6. Preguntas frecuentes',
        ]),
    ]
    story.append(PageBreak())

    # 1. OBJETIVO
    story += [
        Paragraph('1. Qué querés lograr', s_h1),
        Paragraph(
            'Tener tu cotizador funcionando en una dirección web (por ejemplo '
            '<i>https://cotizador.tuempresa.com</i>) para que cualquiera con el link '
            'pueda usarlo desde el navegador, sin instalar nada.',
            s_body),
        Paragraph(
            'Además, querés que los <b>datos (precios, convenios, ítems)</b> se '
            'mantengan en <b>archivos Excel</b> dentro de un repositorio, y que '
            'el sistema los lea automáticamente convertidos a JSON, sin tener que '
            'tocar el código cada vez que cambian.',
            s_body),
        Spacer(1, 0.3*cm),
        callout(
            '<b>En una frase:</b> la página vive en "un disco en internet" (S3). '
            'Los Excel viven en GitHub. Un pequeño proceso convierte los Excel a '
            'JSON automáticamente cada vez que los cambiás.'
        ),
    ]
    story.append(PageBreak())

    # 2. GLOSARIO
    story += [
        Paragraph('2. Glosario — qué es cada cosa', s_h1),
        Paragraph(
            'Vas a escuchar estos nombres todo el tiempo. Acá van con analogías:',
            s_body),
        comparison_table([
            ('API',
             'Una "ventanilla" por la que dos programas se hablan entre sí. Uno pide '
             'algo, el otro responde. Ejemplo: tu cotizador pide "dame la lista de '
             'convenios" y el servidor responde con los datos.',
             'Ventanilla de banco: vos pedís, el cajero responde.'),
            ('AWS',
             'Amazon Web Services. Es el "proveedor de nube" más grande del mundo. '
             'Vos le alquilás servicios: almacenamiento, servidores, bases de datos.',
             'Shopping center de servicios informáticos.'),
            ('S3',
             'Uno de los servicios de AWS. Es un "disco duro en internet" donde '
             'subís archivos. Sirve para publicar páginas web estáticas como la tuya.',
             'Google Drive, pero para programadores.'),
            ('GitHub',
             'Un lugar donde se guarda el <b>código</b> (y cualquier archivo de '
             'texto: Excel, CSV, JSON). Lleva historial de cambios y permite trabajar '
             'en equipo.',
             'Google Docs para código.'),
            ('Supabase',
             'Una <b>base de datos en la nube</b> lista para usar, con API '
             'automática. Sirve si querés guardar cotizaciones, usuarios, o cambios '
             'en tiempo real.',
             'Excel multiusuario en internet, con reglas.'),
            ('JSON',
             'Un formato de texto que las computadoras leen fácil. Son pares '
             '<i>clave: valor</i>. Tu cotizador lee JSON mucho más rápido que Excel.',
             'Una lista estructurada en un papel.'),
            ('Repositorio',
             'Una carpeta de GitHub con tu proyecto adentro.',
             'Una caja rotulada en un depósito.'),
            ('CI/CD',
             'Robot automático que, cuando cambiás algo en GitHub, compila tu sitio '
             'y lo sube a AWS solo.',
             'Cinta transportadora de una fábrica.'),
        ]),
    ]
    story.append(PageBreak())

    # 3. QUÉ NECESITÁS
    story += [
        Paragraph('3. Qué necesitás <b>realmente</b>', s_h1),
        Paragraph(
            'Tu cotizador es una <b>página web estática</b> (hecha con React + Vite). '
            'Toda la lógica corre en el navegador del usuario. Eso simplifica mucho '
            'la infraestructura:',
            s_body),
        Spacer(1, 0.2*cm),
        Paragraph('Obligatorios', s_h2),
        bullets([
            '<b>GitHub</b> — para guardar el código y los Excel fuente.',
            '<b>AWS S3</b> — para publicar la página web en internet.',
            '<b>GitHub Actions</b> (ya incluido en el repo) — para que cada cambio '
            'se publique automáticamente.',
        ]),
        Paragraph('Opcionales (sólo si te hacen falta)', s_h2),
        bullets([
            '<b>CloudFront</b> (AWS) — si querés HTTPS y carga rápida mundial. '
            'Recomendado para producción.',
            '<b>Supabase</b> — <u>sólo</u> si necesitás guardar cotizaciones del '
            'lado del servidor, login de usuarios, o que varios usuarios vean '
            'cambios en vivo. <b>Para tu caso actual no hace falta.</b>',
        ]),
        Paragraph('APIs: ¿se usan acá?', s_h2),
        Paragraph(
            'Hoy tu cotizador <b>no necesita una API propia</b>. Todos los cálculos '
            'pasan dentro del navegador. Las APIs aparecerían si agregás '
            'funcionalidades tipo "guardar cotización para verla después desde otra '
            'PC" — ahí entraría Supabase (o similar), que te regala la API sin que '
            'tengas que programarla.',
            s_body),
        Spacer(1, 0.3*cm),
        callout(
            '<b>Recomendación mínima viable:</b> GitHub + AWS S3 + CloudFront. '
            'Sumá Supabase más adelante <b>sólo</b> si aparece una necesidad real '
            '(historial compartido de cotizaciones, login, multi-usuario).'
        ),
    ]
    story.append(PageBreak())

    # 4. PASO A PASO
    story += [
        Paragraph('4. Paso a paso para publicar la página', s_h1),

        Paragraph('Paso 1 — Abrir una cuenta en AWS', s_h2),
        bullets([
            'Entrá a <b>aws.amazon.com</b> y creá una cuenta (pide tarjeta, pero '
            'hay capa gratuita).',
            'Una vez adentro, creá un <b>usuario IAM</b> con permisos sobre S3 y '
            'CloudFront (tu administrador técnico puede ayudarte; lleva 10 minutos).',
        ]),

        Paragraph('Paso 2 — Crear el "disco" (bucket S3)', s_h2),
        Paragraph(
            'El repositorio ya incluye la "receta" '
            '(<i>infrastructure/s3-static-site.yml</i>). Un administrador corre <b>una '
            'sola vez</b> este comando para que Amazon prepare todo:',
            s_body),
        code(
            'aws cloudformation create-stack \\\n'
            '  --stack-name cotizador-v53-pro \\\n'
            '  --template-body file://infrastructure/s3-static-site.yml \\\n'
            '  --parameters \\\n'
            '      ParameterKey=BucketName,ParameterValue=cotizador-v53-pro-prod \\\n'
            '      ParameterKey=EnableCloudFront,ParameterValue=true \\\n'
            '  --region us-east-1'
        ),
        Paragraph(
            'Al terminar, AWS te devuelve una dirección tipo '
            '<i>https://dXXXX.cloudfront.net</i> — esa es tu página.',
            s_body),

        Paragraph('Paso 3 — Subir el sitio', s_h2),
        Paragraph('<b>Opción A (manual)</b> — correr una sola línea en la terminal:', s_body),
        code('S3_BUCKET=cotizador-v53-pro-prod ./scripts/deploy-s3.sh'),
        Paragraph(
            '<b>Opción B (automática)</b> — cada vez que alguien modifica el código '
            'en GitHub, el robot que ya dejamos armado '
            '(<i>.github/workflows/deploy-s3.yml</i>) lo publica solo. Sólo hay que '
            'configurar 3 valores en GitHub: el rol de AWS, el nombre del bucket y '
            'la región. Tu admin técnico lo hace una vez.',
            s_body),

        Paragraph('Paso 4 — (Opcional) Dominio propio', s_h2),
        bullets([
            'Si tenés <i>tuempresa.com</i>, podés apuntar un subdominio como '
            '<i>cotizador.tuempresa.com</i> a CloudFront.',
            'Requiere un certificado gratis en AWS Certificate Manager.',
        ]),
    ]
    story.append(PageBreak())

    # 5. EXCEL → JSON
    story += [
        Paragraph('5. Migración automática Excel → JSON', s_h1),
        Paragraph(
            'Objetivo: que nadie tenga que <b>pegar datos dentro del código</b>. '
            'Los Excel viven en el repositorio (carpeta <i>data/</i>) y, cuando '
            'cambian, un proceso los convierte a JSON y el sitio los usa.',
            s_body),

        Paragraph('Cómo funciona', s_h2),
        bullets([
            '1. Guardás los Excel en <b>data/excel/</b> del repositorio '
            '(por ejemplo: <i>convenios.xlsx</i>, <i>provincias.xlsx</i>).',
            '2. Un script (<i>scripts/excel-to-json.mjs</i>) lee cada Excel, toma '
            'la primera hoja, usa la primera fila como encabezados y genera un '
            'JSON con el mismo nombre en <b>src/data/</b>.',
            '3. El cotizador importa esos JSON en vez de tener los datos escritos '
            'en el código.',
            '4. El robot de GitHub ejecuta la conversión <b>antes</b> de publicar. '
            'Así, si cambiás un Excel y hacés commit, el sitio sale actualizado '
            'minutos después.',
        ]),

        Paragraph('Estructura esperada en el Excel', s_h2),
        bullets([
            'La <b>primera fila</b> contiene los nombres de las columnas '
            '(ej: <i>codigo, nombre, precio</i>).',
            'Cada fila siguiente es un registro.',
            'Podés tener varias hojas; se convierten a un JSON con varias claves, '
            'una por hoja.',
        ]),

        Paragraph('Ejemplo', s_h2),
        Paragraph('<b>Excel</b> (data/excel/convenios.xlsx):', s_body_left),
        code('codigo | nombre              | precio_hora\n'
             'UOM    | Metalúrgico          | 5400\n'
             'SMATA  | Automotriz           | 5800\n'
             'UOCRA  | Construcción         | 5200'),
        Paragraph('<b>JSON generado</b> (src/data/convenios.json):', s_body_left),
        code('[\n'
             '  { "codigo": "UOM",   "nombre": "Metalúrgico", "precio_hora": 5400 },\n'
             '  { "codigo": "SMATA", "nombre": "Automotriz",  "precio_hora": 5800 },\n'
             '  { "codigo": "UOCRA", "nombre": "Construcción","precio_hora": 5200 }\n'
             ']'),

        Paragraph('Comandos que vas a usar', s_h2),
        code('npm run data:build      # convierte todos los Excel a JSON\n'
             'npm run data:watch      # convierte automáticamente cuando guardás\n'
             'npm run build           # convierte + compila el sitio'),
        callout(
            '<b>Regla de oro:</b> nunca edites los JSON a mano. Siempre editás el '
            'Excel, corrés el comando (o lo hace el robot), y el JSON se regenera.'
        ),
    ]
    story.append(PageBreak())

    # 6. FAQ
    story += [
        Paragraph('6. Preguntas frecuentes', s_h1),

        Paragraph('¿Cuánto cuesta?', s_h2),
        Paragraph(
            'Para un cotizador de uso interno: prácticamente gratis. S3 cobra '
            'centavos por GB almacenado y por cantidad de visitas. CloudFront '
            'tiene 1 TB/mes gratis el primer año. GitHub gratis para '
            'repositorios públicos y privados pequeños.',
            s_body),

        Paragraph('¿Tengo que saber programar para mantenerlo?', s_h2),
        Paragraph(
            'No para cambiar precios o convenios — con editar el Excel y hacer '
            'commit alcanza. Sí para cambiar pantallas o lógica: eso lo toca '
            'quien desarrolla.',
            s_body),

        Paragraph('¿Y si después quiero login y guardar cotizaciones?', s_h2),
        Paragraph(
            'Ahí incorporamos <b>Supabase</b>: te da base de datos + login + API '
            'sin programar nada en el servidor. El cotizador le pregunta a '
            'Supabase en vez de leer JSON locales. Es un paso natural cuando '
            'crezca la necesidad.',
            s_body),

        Paragraph('¿Qué pasa si AWS se cae?', s_h2),
        Paragraph(
            'S3 tiene 99.99% de disponibilidad (menos de 1 hora caído al año). '
            'Para el uso de un cotizador es más que suficiente.',
            s_body),

        Paragraph('¿Puedo migrar a otro proveedor?', s_h2),
        Paragraph(
            'Sí. Como tu sitio es estático (archivos HTML/CSS/JS), funciona '
            'igual en Cloudflare Pages, Netlify, Vercel, GitHub Pages, etc. '
            'Cambia sólo el lugar donde los subís.',
            s_body),

        Spacer(1, 0.5*cm),
        callout(
            '<b>Resumen en 30 segundos:</b><br/>'
            '1) GitHub guarda código y Excel.<br/>'
            '2) Un script convierte Excel a JSON en cada cambio.<br/>'
            '3) GitHub Actions compila el sitio y lo sube a AWS S3.<br/>'
            '4) CloudFront lo sirve rápido y con HTTPS.<br/>'
            '5) Supabase recién hace falta si agregás login o datos compartidos.'
        ),
    ]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f'PDF generado: {OUT}')

if __name__ == '__main__':
    build()
