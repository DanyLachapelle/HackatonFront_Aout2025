# Guide de Test - Notifications de Minuteur (Version 2.0)

## ✅ Nouveau comportement

### **🎯 Principe : Notification intelligente**
- **Notification UNIQUEMENT** quand le minuteur se termine ET que l'application est en arrière-plan
- **Aucune notification** pendant l'utilisation normale de l'application
- **Son d'alarme** toujours présent pour tous les cas

## ✅ Fonctionnalités à tester

### 1. **Notification de fin de minuteur (arrière-plan uniquement)**
- [ ] Notification quand le minuteur se termine ET l'app est en arrière-plan
- [ ] Aucune notification quand on regarde l'application
- [ ] Son d'alarme toujours présent dans tous les cas

### 2. **Détection d'arrière-plan**
- [ ] Détection quand on change d'onglet
- [ ] Détection quand on minimise la fenêtre
- [ ] Détection quand on clique ailleurs

### 3. **Nommage des minuteurs**
- [ ] Possibilité de nommer un minuteur personnalisé
- [ ] Le nom apparaît dans la notification de fin

## 🔧 Instructions de test

### Test 1 : Minuteur avec application active
1. Ouvrir l'application **Horloge**
2. Aller dans l'onglet **Minuteur**
3. Nommer le minuteur "Test actif"
4. Définir une durée de 30 secondes
5. Démarrer le minuteur
6. **Rester sur l'application** pendant que le minuteur tourne
7. Attendre que le minuteur se termine
8. **Résultat attendu** : Son d'alarme ✅, **Aucune notification** ❌

### Test 2 : Minuteur avec application en arrière-plan
1. Ouvrir l'application **Horloge**
2. Aller dans l'onglet **Minuteur**
3. Nommer le minuteur "Test arrière-plan"
4. Définir une durée de 30 secondes
5. Démarrer le minuteur
6. **Changer d'onglet** ou **minimiser la fenêtre**
7. Attendre que le minuteur se termine
8. **Résultat attendu** : Son d'alarme ✅, **Notification** ✅

### Test 3 : Test de détection d'arrière-plan
1. Définir un minuteur de 1 minute
2. Démarrer le minuteur
3. **Tester différents scénarios** :
   - Changer d'onglet du navigateur
   - Minimiser la fenêtre
   - Cliquer sur une autre application
   - Revenir sur l'application avant la fin
4. Vérifier que la notification apparaît seulement si on était en arrière-plan

### Test 4 : Minuteurs rapides
1. Utiliser un minuteur rapide (5 min)
2. Mettre l'application en arrière-plan
3. Attendre la fin
4. Vérifier la notification

## 🎯 Comportement attendu

### ✅ Cas où la notification apparaît :
- Minuteur se termine + Application en arrière-plan
- Minuteur se termine + Onglet différent
- Minuteur se termine + Fenêtre minimisée

### ❌ Cas où AUCUNE notification n'apparaît :
- Minuteur se termine + Application active
- Minuteur se termine + On regarde l'application
- Toutes les autres actions (démarrage, pause, réinitialisation)

### 🔊 Son d'alarme :
- **Toujours présent** dans tous les cas
- Fonctionne même si l'application est en arrière-plan

## 🐛 Problèmes connus et solutions

### Problème : Notification apparaît même en regardant l'app
**Cause** : Détection d'arrière-plan incorrecte
**Solution** : ✅ Implémenté - Détection via `document.hidden` et `window.focus/blur`

### Problème : Trop de notifications
**Cause** : Notifications à chaque action
**Solution** : ✅ Implémenté - Notification uniquement à la fin en arrière-plan

### Problème : Pas de son d'alarme
**Cause** : Son désactivé
**Solution** : ✅ Implémenté - Son toujours présent, notification conditionnelle

## 📝 Notes de développement

- **Détection d'arrière-plan** : `document.hidden` + `window.focus/blur`
- **Notification conditionnelle** : Seulement si `isAppInBackground === true`
- **Son d'alarme** : Toujours présent pour tous les cas
- **UX améliorée** : Pas de spam de notifications
- **Comportement intelligent** : Notification seulement quand nécessaire 