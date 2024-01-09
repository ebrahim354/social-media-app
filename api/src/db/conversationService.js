const { query, pool } = require('./index');

const getUsersOfConversations = async convIds => {
	if (convIds.length == 0) return [];
	try {
		const { rows: conversationsUsers } = await query(`
		select 
		uc.conversation_id "conversationId",
		coalesce (array_agg(
			json_build_object
			('username', u.username, 'id', u.id, 'profilePicture', u.profile_picture, 
			'lastVisit', u.last_visit)
		) filter(where u.id is not null), '{}') "users"
		from conversations c
		left join users_conversations uc on c.id = uc.conversation_id
		left join users u on u.id = uc.user_id
		where uc.conversation_id in (${convIds.join()})
		group by uc.conversation_id;
		`);
		return conversationsUsers;
	} catch (err) {
		console.log('dude', err);
	}
};
const getTopConversations = async userId => {
	let convIds = [];
	try {
		const { rows: conversations } = await query(
			`
			select c.*,
			(
			select array_agg(uc.user_id) from users_conversations uc where uc.conversation_id = c.id and uc.user_id != $1 
			) as users,
			coalesce (array_agg(
			json_build_object
			('author', m.author_id, 'content', m.content, 'createdAt', m.created_at, 
			'updatedAt', m.updated_at, 'id', m.id)
			) filter(where m.created_at is not null), '{}') messages,
					count(m.*) number_of_messages
			from conversations c
			left join messages m on c.id = m.conversation_id
			left join users_conversations uc on c.id = uc.conversation_id 
			left join users u on uc.user_id = u.id
			where uc.user_id = $1 
			group by c.id
					order by number_of_messages DESC
					limit 10;

    `,
			[userId]
		);
		for (let conv of conversations) convIds.push(conv.id);
		const conversationsUsers = await getUsersOfConversations(convIds);
		// ugly but works.
		for (let conv of conversations) {
			for (let convUsrs of conversationsUsers) {
				if (conv.id == convUsrs.conversationId) {
					conv.users = convUsrs.users;
				}
			}
		}
		return conversations;
	} catch (err) {
		console.log('wtf', err);
	}
};


const convSeenByUser = async (userId,conversationId) => {
	try {
		await query(
			`
			update users_conversations set seen = true where user_id = $1 and conversation_id = $2;
    `,
			[userId, conversationId]
		);
	} catch (err) {
		console.log(err);
	}
};


const getOneConversation = async (conversationId) => {
	try {
		const { rows: conversation } = await query(
			`
			select c.*,
			coalesce (array_agg(
				json_build_object
				('author', m.author_id, 'content', m.content, 'createdAt', m.created_at, 
				'updatedAt', m.updated_at, 'id', m.id)
			) filter(where m.id is not null), '{}') messages,
			(
				select array_agg(uc.user_id) from users_conversations uc where uc.conversation_id = c.id
			) as users
			from conversations c
			left join messages m on c.id = m.conversation_id
			where c.id = $1
			group by c.id
    `,
			[conversationId]
		);
		return conversation[0];
	} catch (err) {
		console.log(err);
	}
};

const getConnectedUsers = async userId => {
	try {
		const { rows: friends } = await query(
			`
			select uc.user_id from 
			users_conversations uc
			where uc.conversation_id in (
					select uc.conversation_id 
					from users_conversations uc
					where uc.user_id = $1 
			) and uc.user_id != $1;
    `,
			[userId]
		);
		return friends;
	} catch (err) {
		console.log('new error', err);
	}
};

const addMessage = async (userId, conversationId, content) => {
	console.log(userId, conversationId, content);
	try {
		const { rows: messages } = await query(
			`
			with msg as 
			(
				insert into messages(author_id, conversation_id, content) values($1, $2, $3) returning * 
			), conv_users as 
			(
				update users_conversations set seen = FALSE where conversation_id = $2 and user_id != $1 returning user_id
			)
			select *, 
			(
				select array_agg(user_id) from conv_users
			) as users
			from msg;
		`,
			[userId, conversationId, content]
		);
		console.log('yo addMessage call: ', messages);
		messages[0].author = messages[0].author_id;
		messages[0].createdAt = messages[0].created_at;
		return messages[0];
	} catch (err) {
		console.log(err);
	}
};





const startConversation = async (userIds) => {
	const client = await pool.connect();
	try {
		await client.query('begin');

		const { rows } = await client.query(`
			insert into conversations default values returning *;
		`);
		const conversationId = rows[0].id;

		// prepare userId string.
		let idsStr = "";
		for(let i = 1; i <= userIds.length; i++){
			idsStr += `($${i}, ${conversationId})`
			if(i!= userIds.length) idsStr+= ',';
		}

		await client.query(`
			insert into users_conversations values ${idsStr};
		`, [...userIds]);
		await client.query(`commit`);

		return conversationId;
	} catch (err) {
		await client.query(`rollback`);
		console.log(err);
	} finally {
		client.release();
	}
};



module.exports = {
	getTopConversations,
	getConnectedUsers,
	addMessage,
	getUsersOfConversations,
	startConversation,
	getOneConversation,
	convSeenByUser,
};
