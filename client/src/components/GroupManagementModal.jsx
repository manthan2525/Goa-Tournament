import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const DEFAULT_GROUP_NAMES = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'];

const GroupManagementModal = ({ tournamentId, onClose, onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [mode, setMode] = useState('AUTOMATIC');
  const [numGroups, setNumGroups] = useState(2);
  const [verifiedTeams, setVerifiedTeams] = useState([]);
  const [groupsData, setGroupsData] = useState({});

  const [activeAddGroup, setActiveAddGroup] = useState(null);
  const [selectedAddTeamId, setSelectedAddTeamId] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [tournamentId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/tournaments/${tournamentId}/groups`);
      if (res.data.success) {
        setMode(res.data.mode || 'AUTOMATIC');
        const count = res.data.numberOfGroups || 2;
        setNumGroups(count);
        setVerifiedTeams(res.data.verifiedTeams || []);

        const gMap = {};
        for (let i = 0; i < count; i++) {
          gMap[DEFAULT_GROUP_NAMES[i]] = [];
        }

        const initialAssignments = res.data.groupAssignments || [];
        initialAssignments.forEach((assign) => {
          const gName = assign.groupName || 'Group A';
          if (!gMap[gName]) gMap[gName] = [];
          gMap[gName].push({
            teamRegistrationId: assign.teamRegistrationId?._id || assign.teamRegistrationId,
            teamName: assign.teamName,
          });
        });

        setGroupsData(gMap);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load group data.');
    } finally {
      setLoading(false);
    }
  };

  const handleNumGroupsChange = (newCount) => {
    setNumGroups(newCount);
    setGroupsData((prev) => {
      const nextMap = {};
      for (let i = 0; i < newCount; i++) {
        const gName = DEFAULT_GROUP_NAMES[i];
        nextMap[gName] = prev[gName] || [];
      }
      return nextMap;
    });
  };

  const assignedTeamIds = new Set(
    Object.values(groupsData)
      .flat()
      .map((t) => t.teamRegistrationId?.toString())
  );

  const unassignedTeams = verifiedTeams.filter((t) => !assignedTeamIds.has(t._id.toString()));

  const handleAddTeamToGroup = (groupName, teamId) => {
    if (!teamId) return;
    const team = verifiedTeams.find((t) => t._id.toString() === teamId.toString());
    if (!team) return;

    for (const [gName, teamList] of Object.entries(groupsData)) {
      if (teamList.some((t) => t.teamRegistrationId?.toString() === teamId.toString())) {
        setError(`⚠️ Team "${team.teamName}" is already assigned to ${gName}. A team can belong to ONLY ONE group.`);
        return;
      }
    }

    setError('');
    setGroupsData((prev) => ({
      ...prev,
      [groupName]: [...(prev[groupName] || []), { teamRegistrationId: team._id, teamName: team.teamName }],
    }));
    setSelectedAddTeamId('');
    setActiveAddGroup(null);
  };

  const handleRemoveTeamFromGroup = (groupName, teamRegistrationId) => {
    setError('');
    setGroupsData((prev) => ({
      ...prev,
      [groupName]: prev[groupName].filter((t) => t.teamRegistrationId?.toString() !== teamRegistrationId.toString()),
    }));
  };

  const handleMoveTeam = (fromGroup, toGroup, teamRegistrationId, teamName) => {
    if (fromGroup === toGroup) return;
    setError('');
    setGroupsData((prev) => {
      const fromList = prev[fromGroup].filter((t) => t.teamRegistrationId?.toString() !== teamRegistrationId.toString());
      const toList = [...(prev[toGroup] || []), { teamRegistrationId, teamName }];
      return {
        ...prev,
        [fromGroup]: fromList,
        [toGroup]: toList,
      };
    });
  };

  const handleAutoDistribute = () => {
    if (verifiedTeams.length === 0) return;
    setError('');
    const newGroups = {};
    for (let i = 0; i < numGroups; i++) {
      newGroups[DEFAULT_GROUP_NAMES[i]] = [];
    }

    verifiedTeams.forEach((team, idx) => {
      const gIndex = idx % numGroups;
      const gName = DEFAULT_GROUP_NAMES[gIndex];
      newGroups[gName].push({
        teamRegistrationId: team._id,
        teamName: team.teamName,
      });
    });

    setGroupsData(newGroups);
    setSuccessMessage('Teams distributed automatically across groups!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccessMessage('');

      const flattenedAssignments = [];
      Object.entries(groupsData).forEach(([gName, teams]) => {
        teams.forEach((t) => {
          flattenedAssignments.push({
            groupName: gName,
            teamRegistrationId: t.teamRegistrationId,
            teamName: t.teamName,
          });
        });
      });

      const res = await api.put(`/tournaments/${tournamentId}/groups`, {
        mode,
        numberOfGroups: numGroups,
        assignments: flattenedAssignments,
      });

      if (res.data.success) {
        setSuccessMessage('✓ Group settings and assignments saved successfully!');
        setTimeout(() => {
          if (onSaved) onSaved();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save group assignments.');
    } finally {
      setSaving(false);
    }
  };

  const groupNamesList = Object.keys(groupsData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90dvh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Group Stage Management</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assign teams to groups and set group structure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading group configuration...</div>
          ) : (
            <>
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Assignment Mode & Group Count Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Group Assignment Mode
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMode('AUTOMATIC')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        mode === 'AUTOMATIC'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      ○ Automatic
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode('MANUAL')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        mode === 'MANUAL'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      ● Manual
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Number of Groups
                    </label>
                    {mode === 'MANUAL' && (
                      <button
                        type="button"
                        onClick={handleAutoDistribute}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Auto-Distribute Teams
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {[2, 3, 4, 5, 6, 8].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => handleNumGroupsChange(cnt)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          numGroups === cnt
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {cnt} Groups
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unassigned Teams Pool Banner */}
              {mode === 'MANUAL' && unassignedTeams.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Unassigned Teams ({unassignedTeams.length})
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">
                      Assign all teams to groups before generating fixtures
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {unassignedTeams.map((team) => (
                      <div
                        key={team._id}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-2xs"
                      >
                        <span>{team.teamName}</span>
                        <select
                          onChange={(e) => handleAddTeamToGroup(e.target.value, team._id)}
                          defaultValue=""
                          className="text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-lg border-0 cursor-pointer outline-hidden"
                        >
                          <option value="" disabled>
                            + Group...
                          </option>
                          {groupNamesList.map((gName) => (
                            <option key={gName} value={gName}>
                              {gName}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupNamesList.map((gName) => {
                  const teams = groupsData[gName] || [];

                  return (
                    <div
                      key={gName}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {/* Group Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                          <span className="font-display font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            {gName}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                            {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
                          </span>
                        </div>

                        {/* Teams in Group List */}
                        <div className="space-y-2 mt-3 min-h-[80px]">
                          {teams.length === 0 ? (
                            <div className="py-6 text-center text-[11px] text-slate-400 italic">
                              No teams assigned to {gName} yet.
                            </div>
                          ) : (
                            teams.map((t) => (
                              <div
                                key={t.teamRegistrationId}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs group"
                              >
                                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                  {t.teamName}
                                </span>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <select
                                    value={gName}
                                    onChange={(e) =>
                                      handleMoveTeam(gName, e.target.value, t.teamRegistrationId, t.teamName)
                                    }
                                    className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer outline-hidden"
                                    title="Move team to another group"
                                  >
                                    {groupNamesList.map((targetGrp) => (
                                      <option key={targetGrp} value={targetGrp}>
                                        {targetGrp}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTeamFromGroup(gName, t.teamRegistrationId)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                    title="Remove team from group"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Add Team Button / Inline Selector */}
                      <div className="pt-2">
                        {activeAddGroup === gName ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={selectedAddTeamId}
                              onChange={(e) => setSelectedAddTeamId(e.target.value)}
                              className="flex-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 outline-hidden"
                            >
                              <option value="">-- Select Team --</option>
                              {unassignedTeams.map((team) => (
                                <option key={team._id} value={team._id}>
                                  {team.teamName}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAddTeamToGroup(gName, selectedAddTeamId)}
                              disabled={!selectedAddTeamId}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAddGroup(null);
                                setSelectedAddTeamId('');
                              }}
                              className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAddGroup(gName);
                              setSelectedAddTeamId('');
                            }}
                            className="w-full py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            + Add Team to {gName}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving Groups...' : '💾 Save Group Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupManagementModal;
