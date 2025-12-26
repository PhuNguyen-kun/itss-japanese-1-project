# Profile Feature Testing Guide

## Feature Overview
User Profile screen has been successfully implemented with the following functionality:

### ✅ Implemented Features

1. **Backend API**
   - `GET /api/auth/users/:id` - Get user profile by ID
   - Returns user info with story count and saved story count
   - Includes department information

2. **Frontend Components**
   - Profile page (`/profile` and `/profile/:userId`)
   - Clickable avatars and usernames in:
     - Header (navigates to own profile)
     - StoryCard (navigates to author's profile)
     - DocumentCard (navigates to uploader's profile)

3. **Profile Page Features**
   - Avatar display (with fallback)
   - Username display
   - Profile stats (post count, followers, following)
   - Profile information (department, work history)
   - Settings button (for own profile)
   - Follow button (for other users' profiles)
   - Two tabs:
     - **投稿 (Posts)**: Shows user's stories
     - **保存済み (Saved)**: Shows saved stories (only visible on own profile)

4. **Story Interactions**
   - View stories
   - React to stories
   - Comment on stories
   - Save/unsave stories
   - Edit own stories (when viewing own profile)

## Testing Checklist

### Test 1: Navigate to Own Profile
- [ ] Click on avatar in header → Should navigate to `/profile`
- [ ] Click on username in header → Should navigate to `/profile`
- [ ] Profile should show your own information
- [ ] "設定" (Settings) button should be visible
- [ ] Both "投稿" and "保存済み" tabs should be visible

### Test 2: View Own Posts
- [ ] Click "投稿" tab
- [ ] Should see all your posted stories
- [ ] Each story should have edit option (three-dot menu)
- [ ] Can react to own stories
- [ ] Can comment on own stories
- [ ] Can save/unsave own stories

### Test 3: View Saved Stories
- [ ] Click "保存済み" tab
- [ ] Should see all stories you've saved
- [ ] Can unsave stories from this view
- [ ] Can react and comment on saved stories

### Test 4: Navigate to Other User's Profile
- [ ] Go to Home or Stories page
- [ ] Click on any story author's avatar → Should navigate to `/profile/:userId`
- [ ] Click on any story author's username → Should navigate to `/profile/:userId`
- [ ] Profile should show that user's information
- [ ] "フォロー" (Follow) button should be visible (not "設定")
- [ ] Only "投稿" tab should be visible (no "保存済み" tab)

### Test 5: View Other User's Posts
- [ ] On another user's profile
- [ ] Should see their posted stories
- [ ] No edit option should be available
- [ ] Can react to their stories
- [ ] Can comment on their stories
- [ ] Can save their stories

### Test 6: Navigation from Documents
- [ ] Go to Documents page
- [ ] Click on any document uploader's avatar → Should navigate to their profile
- [ ] Click on any document uploader's username → Should navigate to their profile

### Test 7: Story Interactions from Profile
- [ ] React to a story from profile page
- [ ] Reaction should update immediately
- [ ] Click comment button
- [ ] Comment modal should open
- [ ] Add a comment
- [ ] Comment count should update

### Test 8: Save/Unsave from Profile
- [ ] Click three-dot menu on a story
- [ ] Click "保存" to save
- [ ] Should show success message
- [ ] Click three-dot menu again
- [ ] Should now show "保存を解除"
- [ ] Click to unsave
- [ ] Should show success message

### Test 9: Edit Story from Own Profile
- [ ] On your own profile
- [ ] Click three-dot menu on your story
- [ ] Click "編集"
- [ ] Edit modal should open
- [ ] Make changes and save
- [ ] Story should update in the list

### Test 10: Profile Stats
- [ ] Profile should show correct post count
- [ ] Stats should match actual number of posts in "投稿" tab

## Known Limitations

1. **Follower/Following counts**: Currently hardcoded (12 followers, 8 following) as follow feature is not yet implemented
2. **Work history**: Currently shows placeholder data as this info is not in the database yet
3. **Department**: Shows department name if available, otherwise shows placeholder

## Technical Details

### Routes Added
```javascript
/profile          // Own profile
/profile/:userId  // Other user's profile
```

### API Endpoints
```javascript
GET /api/auth/users/:id  // Get user by ID
```

### Files Modified
- `backend/src/routes/authRoutes.js`
- `backend/src/controllers/authController.js`
- `backend/src/services/authService.js`
- `frontend/src/api/authApi.js`
- `frontend/src/App.jsx`
- `frontend/src/components/AppHeader.jsx`
- `frontend/src/components/StoryCard.jsx`
- `frontend/src/components/DocumentCard.jsx`

### Files Created
- `frontend/src/pages/user/Profile.jsx`

## Browser Testing

### Recommended Test Flow
1. Login to the application
2. Navigate to your profile via header
3. Check both tabs (Posts and Saved)
4. Go to Home page
5. Click on another user's avatar/name
6. Verify their profile shows correctly
7. Try all interactions (react, comment, save)
8. Navigate back to your profile
9. Verify saved stories appear in "保存済み" tab

### Expected Behavior
- All navigation should be smooth without page reloads
- Profile data should load quickly
- Stories should display with proper formatting
- All interactions should work without errors
- Success/error messages should appear for actions

## Troubleshooting

If you encounter issues:

1. **Profile not loading**: Check browser console for API errors
2. **Navigation not working**: Verify routes are properly configured
3. **Stories not showing**: Check if user has posted any stories
4. **Can't see saved tab**: Make sure you're on your own profile
5. **Edit button not showing**: Verify you're viewing your own story on your own profile

## Next Steps (Future Enhancements)

- [ ] Implement actual follow/unfollow functionality
- [ ] Add follower/following lists
- [ ] Add profile edit functionality
- [ ] Add work history and education fields to database
- [ ] Add profile cover photo
- [ ] Add bio/description field
- [ ] Add profile completion percentage
- [ ] Add activity feed on profile

