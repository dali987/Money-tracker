'use client';

import Initializer from '@/Components/Initializer';
import MultiSelectDropdown from '@/Components/Custom/MultiSelectDropdown';
import SearchableSelect from '@/Components/Custom/SearchableSelect';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, User, Link as LinkIcon } from 'lucide-react';
import {
    useSensors,
    useSensor,
    PointerSensor,
    DndContext,
    pointerWithin,
    KeyboardSensor,
    DragOverlay,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableBadge } from '@/Components/Custom/SortableBadge';
import CustomCollapse from '@/Components/Custom/CustomCollapse';
import { motion, AnimatePresence, Variants } from 'motion/react';
const flagUrl = (countryCode: string) =>
    `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`;
const flagSet = (countryCode: string) =>
    `https://flagcdn.com/32x24/${countryCode.toLowerCase()}.png 2x,https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png 3x`;

const page = () => {
    const { rates, currencies } = useTransactionStore();
    const { authUser, updateSetting } = useAuthStore();
    const [options, setOptions] = useState<any>([]);
    const [selected, setSelected] = useState<any>([]);
    const [newCurrencies, setNewCurrencies] = useState<any>([]);
    const [newTag, setNewTag] = useState('');
    const [newGroup, setNewGroup] = useState('');
    const [username, setUsername] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [currGroups, setCurrGroups] = useState<string[]>([]);
    const [currTags, setCurrTags] = useState<string[]>([]);
    const [activeId, setActiveId] = useState(null);
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.25,
                delayChildren: 0.7,
                ease: 'easeOut',
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i?: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i ? i * 0.15 : 0,
                duration: 0.25,
                ease: 'easeOut',
            },
        }),
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    const handleDragOverGroups = (event: any) => {
        const { active, over } = event;

        // Check if the item was actually moved to a different position
        if (over && active.id !== over.id) {
            setCurrGroups((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // This is where you update your persistent storage/DB
                return newOrder;
            });
        }
    };

    const handleDragOverTags = (event: any) => {
        const { active, over } = event;

        // Check if the item was actually moved to a different position
        if (over && active.id !== over.id) {
            setCurrTags((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // This is where you update your persistent storage/DB
                return newOrder;
            });
        }
    };

    const getRatio = (from: string, to: string) => {
        const fromRate = rates[from];
        const toRate = rates[to];
        if (fromRate == toRate) {
            return 1;
        }
        if (fromRate && toRate) {
            return (toRate / fromRate).toFixed(4);
        }
        return 1;
    };

    useEffect(() => {
        if (authUser) {
            setSelected(
                authUser.currencies.filter(
                    (currency: string) => currency !== authUser.baseCurrency,
                ),
            );
            setNewCurrencies(
                authUser.currencies.filter(
                    (currency: string) => currency !== authUser.baseCurrency,
                ),
            );
            setCurrGroups(authUser.groups || []);
            setCurrTags(authUser.tags || []);
            setUsername(authUser.username || authUser.name || '');
            setImageUrl(authUser.image || authUser.profilePic || '');
        }
    }, [authUser]);

    useEffect(() => {
        if (currencies && Object.keys(currencies).length > 0) {
            const newOptions = Object.keys(currencies).map((currency: any) => {
                const currencyData = currencies[currency].data || currencies[currency];
                const countryCode = currencyData.code || currencyData.country_code || 'us';
                if (currency.toUpperCase() === 'EUR') {
                }
                return {
                    label: (
                        <div className="flex items-center gap-3">
                            <img
                                src={flagUrl(countryCode)}
                                srcSet={flagSet(countryCode)}
                                alt={countryCode}
                                className="w-5 h-4 object-cover rounded-sm shadow-sm"
                            />
                            <span className="font-semibold text-gray-700">
                                {currencyData.currency_code}
                            </span>
                            <span className="text-gray-400 text-sm">{currencyData.currency}</span>
                        </div>
                    ),
                    value: currencyData.currency_code,
                    searchText: `${currencyData.currency_code} ${currencyData.currency}`,
                };
            });
            setOptions(newOptions);
        }
    }, [currencies]);

    const handleBaseCurrencyChange = async (value: string) => {
        if (authUser.currencies.includes(value)) {
            const newCurrencies = [...authUser.currencies];
            newCurrencies[newCurrencies.indexOf(value)] = authUser.baseCurrency;

            await updateSetting('currencies', newCurrencies);
            await updateSetting('baseCurrency', value);
            setNewCurrencies(newCurrencies);
        } else {
            await updateSetting('baseCurrency', value);
        }
    };

    const handleAddGroup = async () => {
        if (!newGroup.trim()) return;
        if (currGroups.includes(newGroup.trim())) return;
        const updatedGroups = [...currGroups, newGroup.trim()];
        setCurrGroups(updatedGroups);
        setNewGroup('');
    };

    const handleRemoveGroup = async (group: string) => {
        const updatedGroups = currGroups.filter((g: string) => g !== group);
        setCurrGroups(updatedGroups);
    };

    const handleAddTag = async () => {
        if (!newTag.trim()) return;
        if (currTags.includes(newTag.trim())) return;
        const updatedTags = [...(currTags || []), newTag.trim()];
        setCurrTags(updatedTags);
        setNewTag('');
    };

    const handleRemoveTag = async (tag: string) => {
        const updatedTags = currTags.filter((t: string) => t !== tag);
        setCurrTags(updatedTags);
    };

    const handleSave = async (key: string, value: any) => {
        try {
            await updateSetting(key, value);
            toast.success('Updated successfully');
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    return (
        <main className="bg-base-200 min-h-screen w-full lg:w-[calc(100%-var(--nav-width))] lg:ml-(--nav-width) p-6 lg:p-12 transition-all duration-300">
            {' '}
            <Initializer rates currencies />
            <motion.section
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full lg:p-4 flex flex-col gap-4">
                {/* Profile Section */}
                <CustomCollapse title="Profile">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="username"
                                className="text-sm font-semibold text-gray-600">
                                Username
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <User className="w-4 h-4 opacity-70" />
                                <input
                                    type="text"
                                    id="username"
                                    className="grow"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="image" className="text-sm font-semibold text-gray-600">
                                Profile Picture URL
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 opacity-70" />
                                <input
                                    type="text"
                                    id="image"
                                    className="grow"
                                    placeholder="https://example.com/avatar.png"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                />
                            </label>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-primary self-start w-3/8 cursor-pointer"
                            onClick={async () => {
                                await handleSave('username', username);
                                // Also update name as fallback
                                await updateSetting('name', username);
                                if (imageUrl) {
                                    await updateSetting('image', imageUrl);
                                    await updateSetting('profilePic', imageUrl);
                                }
                            }}>
                            Save
                        </motion.button>
                    </div>
                </CustomCollapse>

                <CustomCollapse title="Currencies">
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col gap-2 grow">
                                    <label
                                        htmlFor="baseCurrency"
                                        className="text-sm font-semibold text-gray-600">
                                        Base Currency
                                    </label>
                                    <SearchableSelect
                                        options={options}
                                        defaultValue={authUser?.baseCurrency}
                                        onSelect={handleBaseCurrencyChange}
                                        name="baseCurrency"
                                        placeholder="Search currency..."
                                    />
                                </motion.div>
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col gap-2 grow">
                                    <label
                                        htmlFor="secondaryCurrency"
                                        className="text-sm font-semibold text-gray-600">
                                        Secondary Currencies
                                    </label>
                                    <MultiSelectDropdown
                                        formFieldName="secondaryCurrency"
                                        options={options.filter(
                                            (option: any) =>
                                                option.value !== authUser?.baseCurrency,
                                        )}
                                        prompt="Select additional currencies"
                                        selected={selected}
                                        onSelect={(values) => updateSetting('currencies', values)}
                                    />
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                        <div className="overflow-x-auto rounded-box border border-base-content/15 bg-base-100">
                            <table className="hidden lg:table">
                                {/* head */}
                                <thead>
                                    <tr>
                                        <th></th>
                                        {authUser &&
                                            [authUser.baseCurrency, ...newCurrencies].map(
                                                (currency: string) => (
                                                    <th
                                                        key={currency}
                                                        className="font-bold text-base-content">
                                                        {currency}
                                                    </th>
                                                ),
                                            )}
                                    </tr>
                                </thead>
                                <motion.tbody
                                    initial="hidden"
                                    animate="visible"
                                    variants={containerVariants}>
                                    <AnimatePresence>
                                        {authUser &&
                                            [authUser.baseCurrency, ...newCurrencies].map(
                                                (currency: string, i: number) => (
                                                    <motion.tr
                                                        key={currency}
                                                        custom={i}
                                                        layout
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        variants={itemVariants}>
                                                        <th className="font-bold text-base-content">
                                                            {currency}
                                                        </th>
                                                        {[
                                                            authUser.baseCurrency,
                                                            ...newCurrencies,
                                                        ].map((currency2: string) => (
                                                            <td key={currency2}>
                                                                {getRatio(currency, currency2)}
                                                            </td>
                                                        ))}
                                                    </motion.tr>
                                                ),
                                            )}
                                    </AnimatePresence>
                                </motion.tbody>
                            </table>
                            <motion.ul
                                className="list lg:hidden"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible">
                                <AnimatePresence mode="popLayout">
                                    {authUser &&
                                        newCurrencies.map((currency: string, i: number) => (
                                            <motion.li
                                                key={currency}
                                                custom={i}
                                                layout
                                                initial="hidden"
                                                animate="visible"
                                                variants={itemVariants}
                                                className="list-row">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-lg">
                                                        1 {currency} ={' '}
                                                        {getRatio(currency, authUser.baseCurrency)}{' '}
                                                        {authUser.baseCurrency}
                                                    </span>
                                                    <p className="text-gray-500 text-sm">
                                                        1 {authUser.baseCurrency} ={' '}
                                                        {getRatio(authUser.baseCurrency, currency)}{' '}
                                                        {currency}
                                                    </p>
                                                </div>
                                            </motion.li>
                                        ))}
                                </AnimatePresence>
                            </motion.ul>
                        </div>
                    </div>
                </CustomCollapse>

                {/* Groups Section */}
                <CustomCollapse title="Groups">
                    <div className="flex flex-col gap-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={pointerWithin}
                            onDragStart={(event: any) => setActiveId(event.active.id)}
                            onDragOver={handleDragOverGroups}
                            onDragCancel={() => setActiveId(null)}
                            onDragEnd={() => setActiveId(null)}>
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-wrap gap-3">
                                <SortableContext items={currGroups} strategy={() => null}>
                                    <AnimatePresence>
                                        {currGroups.map((group, i) => (
                                            <motion.div
                                                key={group}
                                                custom={i}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={itemVariants}
                                                transition={{
                                                    duration: 0.35,
                                                    ease: 'easeOut',
                                                }}>
                                                <SortableBadge
                                                    name={group}
                                                    onRemove={handleRemoveGroup}
                                                    type="primary"
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </SortableContext>
                                <DragOverlay>
                                    {activeId ? (
                                        <SortableBadge
                                            name={activeId}
                                            type="primary"
                                            onRemove={handleRemoveGroup}
                                        />
                                    ) : null}
                                </DragOverlay>
                            </motion.div>
                        </DndContext>
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                placeholder="Add new group..."
                                className="input input-bordered focus:outline-offset-0 focus:outline-1 transition w-full max-w-xs h-10 "
                                value={newGroup}
                                maxLength={20}
                                onChange={(e) => setNewGroup(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-square btn-sm h-10 w-10 min-h-10 cursor-pointer"
                                onClick={handleAddGroup}>
                                <Plus size={20} />
                            </motion.button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-primary self-start w-3/8 cursor-pointer"
                            onClick={() => handleSave('groups', currGroups)}>
                            Save
                        </motion.button>
                    </div>
                </CustomCollapse>

                {/* Tags Section */}
                <CustomCollapse title="Tags">
                    <div className="flex flex-col gap-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={pointerWithin}
                            onDragStart={(event: any) => setActiveId(event.active.id)}
                            onDragOver={handleDragOverTags}
                            onDragCancel={() => setActiveId(null)}
                            onDragEnd={() => setActiveId(null)}>
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="flex flex-wrap gap-3">
                                <SortableContext items={currTags} strategy={() => null}>
                                    <AnimatePresence>
                                        {(currTags || []).map((tag, i) => (
                                            <motion.div
                                                key={tag}
                                                custom={i}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={itemVariants}
                                                transition={{
                                                    duration: 0.35,
                                                    ease: 'easeOut',
                                                }}>
                                                <SortableBadge
                                                    name={tag}
                                                    onRemove={handleRemoveTag}
                                                    type="info"
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </SortableContext>
                                <DragOverlay>
                                    {activeId ? (
                                        <SortableBadge
                                            name={activeId}
                                            type="info"
                                            onRemove={handleRemoveTag}
                                        />
                                    ) : null}
                                </DragOverlay>
                            </motion.div>
                        </DndContext>
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                placeholder="Add new tag..."
                                className="input input-bordered focus:outline-offset-0 focus:outline-1 transition w-full max-w-xs h-10"
                                value={newTag}
                                maxLength={20}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-square btn-sm h-10 w-10 min-h-10 cursor-pointer"
                                onClick={handleAddTag}>
                                <Plus size={20} />
                            </motion.button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn btn-primary self-start w-3/8 cursor-pointer"
                            onClick={() => handleSave('tags', currTags)}>
                            Save
                        </motion.button>
                    </div>
                </CustomCollapse>
            </motion.section>
        </main>
    );
};

export default page;
