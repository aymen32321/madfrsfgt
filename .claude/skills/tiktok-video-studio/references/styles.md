# Les 5 styles éprouvés

Chaque style a déjà été livré et validé. Son code source complet est fourni dans `assets/examples/<style>/` : le lire pour reprendre des pièces (en-têtes, compteurs, cartes, pictos, caméra 3D) plutôt que de tout réécrire. Ces fichiers importent des `captions.json` et des images de leur projet d'origine : copier les pièces utiles dans la nouvelle composition, pas le fichier entier.

## Choisir un style

| Le sujet ressemble à… | Style | Pourquoi |
|---|---|---|
| Un chiffre, un coût, une astuce d'argent, une stat | **A. Data nuit** | Les nombres sont les héros ; compteurs, barres et un fil « économies » donnent la progression |
| Une comparaison, un face-à-face, un « qui est le meilleur » | **B. Duel 3D** | Un plateau de jeu télévisé rend le match lisible : score, manches, verdict |
| Un récit spirituel, historique ou émotionnel, une citation, un texte sacré | **C. Récit nuit et or** | Symboles sobres (lunes, points de lumière, dômes), rythme lent, typographie respectueuse |
| Une liste d'objets ou d'étapes, un guide pratique, une info officielle | **D. Objets dans un contenant** | Chaque élément cité « tombe » dans un sac, une boîte, une checklist : on voit la liste se remplir |
| Une histoire avec un personnage (client, salarié, voisin…), un fait divers, une astuce racontée | **E. Personnages 3D + cartes** | Des personnages expressifs portent l'émotion, des cartes d'interface portent les preuves (ticket, formulaire, avis) |

Si une vidéo de référence est fournie, son style prime : le reconnaître dans ce tableau, puis reproduire ses spécificités relevées sur la planche d'images.

---

## A. Data nuit (« Ce que ça te coûte »)

- **Exemple** : `assets/examples/a-data/CeQueCaTeCoute.tsx` (25 s, sans voix, 7 scènes).
- **Fond** : bleu nuit `#0a0e16` avec halo radial bleu `rgba(59,130,246,0.16)` en haut, vignette.
- **Couleurs** : texte `#f3f4f6`, gris `#6b7280`, bleu `#3b82f6` (gain), orange `#f97316` (coût).
- **Typo** : Inter ; chiffres géants 170–230 px weight 800, letter-spacing −6 ; étiquettes 24–26 px capitales espacées (letter-spacing 7–8).
- **Mise en page** : en-tête fixe (série « CE QUE ÇA TE COÛTE · N°2 », pastille « ÉCONOMIES 0 € », pastille de section + points de progression), scène centrale 470–1250, sous-titres à `CAPTION_TOP` 1300 en style `rise` (l'original sans voix les plaçait à 1470 : rester à 1300 maximum quand la vidéo sera publiée).
- **Mouvement** : compteurs qui défilent (easing out), barres qui se remplissent, prix barré par un trait qui se dessine, cases de mois qui s'allument une à une, interrupteur qu'on coupe avec un « doigt » (cercle) qui tape.
- **Son** : tics en gamme montante quand les éléments s'allument, montée sous une barre, « ka-ching » quand les économies montent, impact sur le total.
- **Chiffres** : uniquement des calculs vérifiables (9,99 × 12 = 119,88).

## B. Duel 3D low-poly (« Le Duel »)

- **Exemple** : `assets/examples/b-duel3d/` (41 s) — `script.ts` (beats), `Stage3D.tsx` (Three.js), `Overlay.tsx` (habillage), `LeDuel.tsx` (caméra, sons).
- **Rendu** : `@remotion/three` + `@react-three/fiber`, `Config.setChromiumOpenGlRenderer('swangle')` obligatoire sans GPU.
- **Plateau** : sol orange/bleu coupé au centre, mur clair avec baies vitrées, arche d'ampoules qui clignotent en fête, pupitre rayé rose/jaune, deux socles avec étiquettes (texture canvas).
- **Personnages en blocs** : présentateur (tête, cheveux, bouche dont la hauteur suit `|sin(t)|` quand il parle, clignements, gestes « pointer », « réfléchir », « hausser les épaules ») ; candidats stylisés (cube orange à pattes, icosaèdre blanc à antenne) qui sautillent en parlant.
- **Habillage HTML** : tableau des scores orange/bleu à bord jaune, chiffres qui rebondissent au point, annonce « MANCHE N » sur rayons coniques roses/jaunes, bulles de dialogue avec étiquette du locuteur, cartes (code, terminal, poème), confettis.
- **Caméra** : plans nommés (large, présentateur, candidat, candidat+carte) interpolés en 14 images, léger travelling avant.
- **Écriture** : beats `{dur, shot, speaker, caption, card, burst, score, gesture}` dans `script.ts`.
- **Rendu lent** : environ 10 min pour 40 s (WebGL logiciel).

## C. Récit nuit et or (« Rappel »)

- **Exemple** : `assets/examples/c-recit-nuit-or/` (118 s) — `art.tsx` (SVG), `Rappel.tsx` (chronologie).
- **Fond** : brun-noir chaud `#0b0908` → `#18130e`, étoiles qui scintillent ; rayons dorés coniques pour les moments sacrés.
- **Couleurs** : or `#f0c45a`, crème `#f6e7bd`, indigo pour les lits et les fenêtres, fumée violet-noir.
- **Symboles** : lunes (une par nuit, étiquette dorée), tonneaux de dattes, point lumineux = un personnage (avec un halo), fumée floutée = le mal ou le voleur, lasso doré (ellipses horizontales dont seul le tracé tourne), dôme de protection, lit, fenêtre cintrée, octogramme, réseau de points pour le partage.
- **Typo** : Poppins (sous-titres 54–57 px weight 700 sur pastilles sombres soulignées d'indigo), Amiri pour l'arabe (voir `arabic-rtl.md`).
- **Cartes** : pastille « source » en haut (référence du hadith ou du verset), pastille dorée « Le Prophète ﷺ », citations dans des cartes à bord doré avec un guillemet doré.
- **Interactif** : verset mot à mot avec translittération (mot courant en or) et traduction, puis micro « À toi » avec anneau qui se remplit pendant la pause de répétition.
- **Ton** : aucune exagération, pas de rebond ; entrées en « blur swap ».

## D. Objets dans un contenant (« Kit d'urgence »)

- **Exemple** : `assets/examples/d-objets-contenant/` (83 s) — `icons.tsx` (20 pictos), `Kit.tsx` (scènes), `narration.txt`.
- **Fond** : crème `#f3ede2` avec trame de points, bande de sécurité orange/noire en bas.
- **Couleurs** : encre `#1b1b1f`, orange sécurité `#ff5b1f`, sarcelle `#0e6e7e`, jaune `#ffc93c`, rouge `#e63946`.
- **Pictos** : plats, contour encre 5 px, ombre portée dure décalée (copie noircie à 14 %), boîte 200×200.
- **Mécanique centrale** : le contenant (sac) est ouvert en bas ; chaque élément apparaît au centre au moment où la voix le cite, puis tombe en arc (ease-in, 0,42 s) et passe derrière le devant du sac ; le sac s'écrase légèrement (ressort amorti) ; compteur `07/16` et barre segmentée en haut.
- **Parties suivantes** : une scène par idée (jauge circulaire 72 h où monte le sac fermé, maison sous l'orage, calendrier entouré, grand « 3 » puis 3 cartes, téléphone avec guide, bouclier + jauge de probabilité, thermomètre + courbe sans chiffres) ; fin sur le contenant fermé + badge ✓.
- **Avec hook d'origine** : garder les premières secondes de la vidéo source, puis ouvrir l'animation par un cercle (clip-path) qui grandit depuis l'objet du hook ; le rayon final doit couvrir les coins (≥ 1650 px).

## E. Personnages 3D + cartes d'interface (« Ticket McDo »)

- **Exemple** : `assets/examples/e-personnages-cartes/` (62 s) — `Ticket.tsx` et sa narration ; les images générées ne sont pas fournies (les régénérer, voir `ai-assets.md`). Le modèle `Story.tsx` reprend la structure de ce style.
- **Fond** : violet nuit `#3a2a8f` → `#23185f` → `#120d33`, grille fine à 3,5 %, étoiles, vignette.
- **Personnages** : images 3D façon Pixar générées par IA sur fond transparent (voir `ai-assets.md`) ; le héros toujours à gauche (x ≈ 260–300, pieds à y 1250, hauteur 720–780 px), l'autre personnage ou l'objet à droite ; léger balancement (±0,8°), ombre floue au sol.
- **Cartes** : verre sombre (`rgba(20,14,50,0.85)`, bord blanc 18 %) pour les infos, blanc pour les documents (ticket de caisse en police monospace avec bord dentelé, formulaire qui se remplit avec curseur, e-mail avec ligne surlignée), note sur 5 qui chute avec tremblement, interrupteur, tampon « NON », pastille jaune « ATTENTION ».
- **Sous-titres** : capitales Inter Display 900 58 px, mots clés en rouge `#ff3b47`, groupes de 2 à 4 mots, sans ponctuation finale.
- **Marques** : nommer la marque en texte stylisé, jamais son vrai logo ; décors et uniformes génériques.

---

## Règles communes à tous les styles

Elles viennent des skills de motion design installés (LottieFiles, iart-ai, HyperFrames) et ont été vérifiées sur ces 5 vidéos :

- **Zone sûre 9:16** : textes entre y 170 et y 1330, rien d'important dans les 120 px de droite ; sous 1330, seulement du décor.
- **Image 0** = miniature : jamais noire, jamais un logo seul.
- **Rythme** : quelque chose de nouveau toutes les 2 à 4 s ; un élément arrivé reste immobile (pas de flottement permanent sur les titres).
- **Entrées** : `cubic-bezier(0.16,1,0.3,1)` en 0,35–0,5 s avec flou 8–10 px → 0. **Sorties** : `(0.7,0,0.84,0)`, 40–50 % plus courtes.
- **Rebond** : seulement sur les apparitions d'objets, amplitude 4–8 % ; jamais sur le texte ni dans un ton grave (style C).
- **Une couleur = un sens** pendant toute la vidéo (rouge = problème, jaune = gain, etc.).
- **Aucun chiffre inventé** présenté comme vrai : courbes sans graduations, données fictives clairement d'exemple.
