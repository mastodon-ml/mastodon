import classNames from 'classnames';

import { animated, useTransition } from '@react-spring/web'

import { emojiToUnicodeHex, isUnicodeEmoji } from '@/mastodon/features/emoji/utils';
import { reduceMotion } from '@/mastodon/initial_state';

import { AnimatedNumber } from '@/mastodon/components/animated_number';
import { useContext, useState } from 'react';
import { AnimateEmojiContext } from './emoji/context';
import { useEmojiAppState } from '../features/emoji/mode';
import { EMOJI_MODE_NATIVE } from '../features/emoji/constants';
import { emojiToInversionClassName, unicodeHexToUrl } from '../features/emoji/normalize';

export const StatusReactions: React.FC<{
  statusId: string;
  numVisible?: number;
  addReaction?: (status: any, name: string, url: string) => void;
  removeReaction?: (status: any, name: string, url?: string) => void;
  canReact: boolean;
  reactions: Immutable.List<any>
}> = ({
  statusId,
  reactions,
  numVisible = Infinity,
  addReaction,
  canReact,
  removeReaction,
}) => {

    let visibleReactions = reactions
      .filter(x => x.get('count') > 0)
      .sort((a, b) => b.get('count') - a.get('count'))
      .toJS();

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
      <div className={classNames('reactions-bar', { 'reactions-bar--empty': visibleReactions.length === 0 })}>
        {transitions(({ scale }, item) => (
          <Reaction
            key={item.name}
            statusId={statusId}
            reaction={item}
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

const Reaction: React.FC<{
  statusId: string;
  reaction: any;
  addReaction?: (status: any, name: string, url: string) => void;
  removeReaction?: (status: any, name: string, url?: string) => void;
  canReact: boolean;
  style: any;
}> = ({
  statusId,
  reaction,
  addReaction,
  removeReaction,
  canReact,
  style,
}) => {
    const handleClick = () => {
      if (reaction.me) {
        removeReaction !== undefined && removeReaction(statusId, reaction.name);
      } else {
        addReaction !== undefined && addReaction(statusId, reaction.name, reaction.url);
      }
    }
    const [hovered, setHovered] = useState(false)
    const handleMouseEnter = () => setHovered(true)
    const handleMouseLeave = () => setHovered(false)



    return (
      <animated.button
        className={classNames('reactions-bar__item', { active: reaction.me })}
        onClick={handleClick}
        disabled={!canReact}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className='reactions-bar__item__emoji'>
          <Emoji emoji={reaction.name} hovered={hovered} url={reaction.url} staticUrl={reaction.static_url}/>
        </span>
        <span className='reactions-bar__item__count'>
          <AnimatedNumber value={reaction.count} />
        </span>
      </animated.button>
    );
  }

const Emoji: React.FC<{
  emoji: string;
  hovered: boolean;
  url?: string;
  staticUrl?: string;
}> = ({emoji, hovered, url, staticUrl}) => {
  const isCustom = !isUnicodeEmoji(emoji)
  const animate = useContext(AnimateEmojiContext) || hovered
  const emojiState = useEmojiAppState()

  const inversionClass = !isCustom && emojiToInversionClassName(emoji)
  if (!isCustom && emojiState.mode === EMOJI_MODE_NATIVE) {
    return emoji
  }
  if (isCustom) {
    return (
      <img
        src={animate ? url : staticUrl}
        alt={emoji}
        title={emoji}
        className='emojione custom-emoji'
        loading='lazy'
      />
    )
  }
  const src = unicodeHexToUrl({unicodeHex: emojiToUnicodeHex(emoji), ...emojiState})
  return (
    <img
      src={src}
      alt={emoji}
      className={classNames('emojione', inversionClass)}
      loading='lazy'
    />
  )
}

export default StatusReactions
