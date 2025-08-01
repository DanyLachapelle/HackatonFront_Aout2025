# Guide de Test - Calendrier

## ✅ Fonctionnalités à tester

### 1. **Affichage des événements**
- [ ] Les événements s'affichent au bon endroit (bonne date)
- [ ] Les événements avec heures affichent les heures correctement
- [ ] Les événements "toute la journée" s'affichent sans heures

### 2. **Création d'événements**
- [ ] Créer un événement "toute la journée"
- [ ] Créer un événement avec heures spécifiques
- [ ] Vérifier que l'événement apparaît au bon endroit
- [ ] Vérifier que les rappels automatiques sont créés

### 3. **Suppression d'événements**
- [ ] Supprimer un événement via le bouton × (survol)
- [ ] Supprimer un événement via le bouton dans la liste
- [ ] Vérifier la confirmation avant suppression
- [ ] Vérifier que l'événement disparaît de l'affichage
- [ ] Vérifier que les rappels associés sont supprimés

### 4. **Gestion des erreurs**
- [ ] Tester avec le backend arrêté
- [ ] Vérifier que l'ErrorBoundary fonctionne
- [ ] Vérifier les messages d'erreur appropriés

## 🔧 Instructions de test

### Test 1 : Création d'événements
1. Ouvrir le calendrier
2. Cliquer sur une date (ex: 1er janvier)
3. Créer un événement "Réunion" à 14h00-15h00
4. Vérifier qu'il apparaît au bon endroit
5. Créer un événement "Anniversaire" toute la journée
6. Vérifier qu'il s'affiche sans heures

### Test 2 : Suppression d'événements
1. Survoler un événement dans le calendrier
2. Cliquer sur le bouton × rouge qui apparaît
3. Confirmer la suppression
4. Vérifier que l'événement disparaît
5. Vérifier que les rappels sont supprimés

### Test 3 : Synchronisation backend
1. Créer un événement
2. Vérifier qu'il est sauvegardé en base
3. Supprimer l'événement
4. Vérifier qu'il est supprimé de la base
5. Recharger la page et vérifier la cohérence

## 🐛 Problèmes connus et solutions

### Problème : Événements mal positionnés
**Cause** : Incohérence entre `event.date` et `event.startDate`
**Solution** : ✅ Corrigé - Utilisation cohérente de `event.date`

### Problème : Suppression sans confirmation
**Cause** : Pas de confirmation utilisateur
**Solution** : ✅ Corrigé - Ajout de `confirm()` avant suppression

### Problème : Pas d'indicateur de chargement
**Cause** : Pas de feedback visuel pendant la suppression
**Solution** : ✅ Corrigé - Ajout d'état `isDeleting` et indicateur visuel

## 📝 Notes de développement

- Les événements utilisent maintenant la propriété `date` pour l'affichage
- La suppression est confirmée par l'utilisateur
- Les rappels sont automatiquement supprimés avec l'événement
- L'interface affiche un indicateur de chargement pendant la suppression
- Le rechargement automatique assure la synchronisation avec le backend

## 🔔 Système de notifications

### Types de notifications implémentés :
1. **📅 Calendrier** - Rappels d'événements ✅
2. **⏰ Minuteur** - Notifications de minuteur et chronomètre ✅
3. **⚙️ Système** - Notifications système ✅

### Types de notifications préparés mais non utilisés :
1. **💬 Messages** - Système de messagerie
2. **🔄 Mises à jour** - Notifications de mises à jour 