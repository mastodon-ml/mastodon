import classNames from 'classnames';

import { animated, useTransition } from '@react-spring/web'

import { Emoji  } from './emoji';
import { reduceMotion } from '../initial_state';

import { AnimatedNumber } from './animated_number';

const StatusReactions = (
    statusId,
    reactions,
    numVisible,
    addReaction,
    canReact,
    removeReaction,
  ) => {

    let visibleReactions = reactions
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);

    if (numVisible >= 0) {
      visibleReactions = visibleReactions.filter((_, i) => i < numVisible);
    }

    const transitions = useTransition(visibleReactions, {
    from: {
      scale: 0,
    },
    enter: {
      scale: 1,
    },
    leave: {
      scale: 0,
    },
    immediate: reduceMotion,
    keys: visibleReactions.map(x => x.name),
  });

  return (
    <div className={classNames('reactions-bar', { 'reactions-bar--empty': visibleReactions.isEmpty() })}>
      {transitions(({ scale }, reaction) => (
        <Reaction
          key={reaction.name}
          statusId={statusId}
          reaction={data}
          style={{ transform: scale.to((s) => `scale(${s})`) }}
          addReaction={addReaction}
          removeReaction={removeReaction}
          canReact={canReact}
        />
      )
    )}
    </div>
  );
}

const Reaction = (
    statusId,
    reaction,
    addReaction,
    removeReaction,
    canReact,
    style,
  ) => {


  const handleClick = () => {
    if (reaction.me) {
      removeReaction(statusId, reaction.name);
    } else {
      addReaction(statusId, reaction.name);
    }
  }

  const code = isUnicodeEmoji(reaction.name)
    ? reaction.name
    : `:${reaction.name}:`;

  return (
    <animated.button
      className={classNames('reactions-bar__item', { active: reaction.me })}
      onClick={handleClick}
      disabled={!canReact}
      style={style}
    >
      <span className='reactions-bar__item__emoji'>
        <Emoji code={code} />
      </span>
      <span className='reactions-bar__item__count'>
        <AnimatedNumber value={reaction.count} />
      </span>
    </animated.button>
  );
}

export default StatusReactions
