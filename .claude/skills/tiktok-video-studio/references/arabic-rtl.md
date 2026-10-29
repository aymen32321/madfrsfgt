# Arabe et textes sacrés

## Rendu

- Police explicite : Amiri (`@fontsource/amiri/arabic-400.css` et `arabic-700.css`), jamais la police latine par défaut.
- Conteneur avec `dir="rtl" lang="ar"`, sans `letterSpacing` ni `textTransform`.
- Animer **mot par mot** (découper sur les espaces) : chaque lettre seule dans un `inline-block` perd ses liaisons. Pour un verset qui se construit, rendre la ligne complète et rendre visibles les mots un à un : la ligne reste fixe et grandit depuis la droite.
- Le symbole ﷺ (U+FDFA) s'affiche correctement en Amiri.
- Attendre le chargement des polices avant le rendu :

```tsx
const [handle] = useState(() => delayRender('polices'));
useEffect(() => {
  Promise.all(['400 40px Amiri', '700 40px Amiri'].map((f) => document.fonts.load(f, 'اللَّه'))).then(() => continueRender(handle));
}, [handle]);
```

## Mise en scène d'un verset (style C)

- Titre du passage en arabe dans un octogramme doré (deux carrés à 45°, qui tournent de 4° par seconde), sous-titre en français.
- Ligne arabe 92 px, translittération 38 px avec le mot en cours en or, traduction 28 px en gris clair.
- Pause « À toi » : icône micro dans un anneau doré qui se remplit pendant la durée de la répétition.
- Pastille de source en haut : « Coran · al-Baqara 2:255 », « al-Bukhârî 2311 · authentique », « Sahih Muslim · 2674 ».

## Exactitude

- Recopier les versets et les invocations depuis la vidéo de référence ou une source fiable ; ne pas les recomposer de mémoire sans le signaler.
- Toujours écrire dans la livraison que l'arabe doit être relu par une personne qui le lit, avant publication.
- Garder les formules de respect prononcées (« que la paix et le salut soient sur lui ») dans les sous-titres.
