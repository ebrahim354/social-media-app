const { query } = require('./index');

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
		console.log('hi this is after error');
		return conversations;
	} catch (err) {
		console.log('wtf', err);
	}
};

const getOneConversation = async (userId, conversationId) => {
	try {
		const { rows: conversation } = await query(
			`
    select c.*,
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
		where uc.user_id = $1 and conversationId = $2
		group by c.id
    `,
			[userId, conversationId]
		);
		const conversationUsers = await getUsersOfConversations(conversation[0].id);
		conversation.users = conversationUsers.users;
		return conversation;
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
	try {
		const { rows: message } = await query(
			`
			insert into messages(author_id, conversation_id, content) values(
				$1, $2, $3
			) returning *;
		`,
			[userId, conversationId, content]
		);
		return message[0];
	} catch (err) {
		console.log(err);
	}
};

const startConversation = async usersIds => {
	try {
		const { rows: conversation } = await query(`
				with conversation as (
					insert into conversations default values returning id
				)
				insert into users_conversations(conversation_id, user_id)
				select conversation.id , "users" from conversation, 
				unnest(array[${usersIds.join()}]) "users" returning conversation_id;	
		`);
		return conversation[0].conversation_id;
	} catch (err) {
		console.log(err);
	}
};

module.exports = {
	getTopConversations,
	getConnectedUsers,
	addMessage,
	getUsersOfConversations,
	startConversation,
	getOneConversation,
};
