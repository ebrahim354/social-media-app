-- joined user query
select u1.*,
coalesce (array_agg(json_build_object('username', u2.username, 'profilePicture', u2.profile_picture)) 
filter (where u2.username is not null), '{}') friends,
coalesce (array_agg(json_build_object('username', u3.username, 'profilePicture', u3.profile_picture)) 
filter (where u3.username is not null), '{}') friendRequests
from users u1
left join friendship f on u1.id in (f.user1_id, f.user2_id) 
left join users u2 on (u2.id in (f.user1_id, f.user2_id) and u2.id != u1.id)
left join friend_request f2 on u1.id = f2.receiver 
left join users u3 on f2.sender = u3.id
group by u1.id;

-- joined post query
select p.*, json_build_object('id', author.id,'username', author.username, 'profilePicture', author.profile_picture) as user,
coalesce (array_agg(json_build_object('id', u.id,'username', u.username, 'profilePicture', u.profile_picture)) 
filter (where u.username is not null), '{}') as likes,
coalesce (array_agg(
  json_build_object
  ('id', u2.id,'username', u2.username, 'profilePicture', u2.profile_picture,
   'content', c.content, 'img', c.img, 'createdAt', c.created_at, 'updatedAt', c.updated_at, 'likes',
   (
    select coalesce(array_agg(cl.user_id), '{}') from comment_likes cl where cl.comment_id = c.id
   )
  )
) 
filter (where u2.username is not null), '{}') as comments
from posts p
join users author on  p.author = author.id
left join post_likes pl on p.id = pl.post_id
left join users u on pl.user_id = u.id
left join comments c on p.id = c.post_id
left join users u2 on c.user_id = u2.id
where p.author = 1 or p.author in (
  select 
  case  
    when user1_id = p.author then user2_id 
    when user2_id = p.author then user1_id
  end
  from friendship where p.author in (user1_id, user2_id)
)
group by p.id, author.username, author.profile_picture, author.id;





insert into post_likes(user_id, post_id) values(1, 1) 
on conflict(user_id, post_id) do  update set liked = not post_likes.liked returning liked;
